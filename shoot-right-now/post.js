/* post.js — screen pass for 지금 바로 쏴! (three.js r128, no examples/ files)

   high : the scene is drawn into a 4x MSAA target (WebGL2), then
          bright pass -> two blurred mips (1/4 and 1/8) -> composite with
          bloom, a light colour grade and a vignette.
   low  : straight to the screen, as before (pixel ratio capped lower).

   The materials already tone-map (ACES) and encode to sRGB inside their own
   shaders when the target texture says sRGB, so the composite works on
   display-ready colour and writes it out unchanged apart from the grade.

   window.MGPost = { render(renderer, scene, camera), resize(renderer),
                     quality, setQuality('auto'|'high'|'low'), sample(dtMs) } */
(function () {
  "use strict";
  const T = window.THREE;
  if (!T) return;

  const KEY = "mgGfx";
  let pref = "auto";
  try { pref = localStorage.getItem(KEY) || "auto"; } catch (e) {}
  try {
    const q = new URLSearchParams(location.search).get("gfx");
    if (q === "high" || q === "low" || q === "auto") pref = q;
  } catch (e) {}

  let level = pref === "low" ? "low" : "high";
  let ready = false;
  let broken = false;
  let rtScene = null, rtB0 = null, rtB1 = null, rtC0 = null, rtC1 = null;
  let rtD = null, rtA0 = null, rtA1 = null, rtG = null;
  let quad = null, qScene = null, qCam = null;
  let mBright = null, mBlur = null, mComp = null, mAO = null, mAOBlur = null, mRays = null, depthOnly = null;
  /* (v24) screen-space extras: ambient occlusion from a half-res depth
     pre-pass, sun shafts from the bloom bright pass, a hurt pulse */
  const FX = { ao: 0.62, rays: 0.55, hurt: 0, aoOn: true };
  /* (v46) the mood grade: the scene is already ACES tone-mapped by the
     materials, so this only nudges contrast, saturation and a colour cast on
     the display-ready image — the stage sets it (war = warm and heavy, snow =
     cool and flat, dusk = magenta shadows) without touching the lights */
  const TONE = { sat: 1.07, con: 1.045, tint: [0.018, 0.008, -0.014], bloom: 0.6, vig: 0.26, rays: 0.55 };
  function setTone(o) {
    if (!o) return;
    if (o.sat != null) TONE.sat = o.sat;
    if (o.con != null) TONE.con = o.con;
    if (o.tint) TONE.tint = o.tint.slice(0, 3);
    if (o.bloom != null) TONE.bloom = o.bloom;
    if (o.vig != null) { TONE.vig = o.vig; FX.vig = o.vig; }
    if (o.rays != null) { TONE.rays = o.rays; FX.rays = o.rays; }
    window.__tone = { sat: TONE.sat, con: TONE.con, tint: TONE.tint.slice(), bloom: TONE.bloom, vig: TONE.vig, rays: TONE.rays };
  }

  /* (v24) height fog: every material's fog thins with altitude, so streets
     sit in haze while towers and hills rise out of it */
  try {
    const C = T.ShaderChunk;
    C.fog_pars_vertex = C.fog_pars_vertex.replace("varying float fogDepth;", "varying float fogDepth;varying float vFogY;");
    C.fog_vertex = C.fog_vertex.replace("fogDepth = - mvPosition.z;",
      "fogDepth = - mvPosition.z;\n" +
      "#ifdef USE_INSTANCING\n vFogY = (modelMatrix * instanceMatrix * vec4(transformed,1.0)).y;\n#else\n vFogY = (modelMatrix * vec4(transformed,1.0)).y;\n#endif\n");
    C.fog_pars_fragment = C.fog_pars_fragment.replace("varying float fogDepth;", "varying float fogDepth;varying float vFogY;");
    C.fog_fragment = C.fog_fragment.replace("gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );",
      "fogFactor *= 1.0 - 0.55 * smoothstep(4.0, 70.0, vFogY);\n\tgl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );");
  } catch (e) { window.__fogPatchErr = String(e); }
  const size = new T.Vector2();

  const VS = "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}";

  function shader(fs, uniforms) {
    return new T.ShaderMaterial({
      vertexShader: VS, fragmentShader: fs, uniforms: uniforms,
      depthTest: false, depthWrite: false, toneMapped: false
    });
  }

  function makeRT(w, h, ms, renderer) {
    const opt = { minFilter: T.LinearFilter, magFilter: T.LinearFilter, format: T.RGBAFormat, depthBuffer: !!ms, stencilBuffer: false };
    let rt;
    if (ms && T.WebGLMultisampleRenderTarget && renderer.capabilities.isWebGL2) {
      rt = new T.WebGLMultisampleRenderTarget(w, h, opt);
      rt.samples = 4;
    } else {
      rt = new T.WebGLRenderTarget(w, h, opt);
    }
    rt.texture.generateMipmaps = false;
    /* sRGB on the scene target makes every lit material encode for display,
       exactly as when it draws to the canvas */
    if (ms && T.sRGBEncoding) rt.texture.encoding = T.sRGBEncoding;
    return rt;
  }

  function init(renderer) {
    if (ready || broken) return ready;
    try {
      if (!renderer.capabilities.isWebGL2) { level = "low"; broken = true; return false; }
      renderer.getDrawingBufferSize(size);
      const w = Math.max(1, size.x), h = Math.max(1, size.y);
      rtScene = makeRT(w, h, true, renderer);
      rtB0 = makeRT(w >> 2 || 1, h >> 2 || 1, false, renderer);
      rtB1 = makeRT(w >> 2 || 1, h >> 2 || 1, false, renderer);
      rtC0 = makeRT(w >> 3 || 1, h >> 3 || 1, false, renderer);
      rtC1 = makeRT(w >> 3 || 1, h >> 3 || 1, false, renderer);
      rtD = new T.WebGLRenderTarget(w >> 1 || 1, h >> 1 || 1, { minFilter: T.NearestFilter, magFilter: T.NearestFilter, format: T.RGBAFormat, depthBuffer: true, stencilBuffer: false });
      rtD.depthTexture = new T.DepthTexture(w >> 1 || 1, h >> 1 || 1);
      rtD.depthTexture.type = T.UnsignedIntType;
      rtA0 = makeRT(w >> 1 || 1, h >> 1 || 1, false, renderer);
      rtA1 = makeRT(w >> 1 || 1, h >> 1 || 1, false, renderer);
      rtG = makeRT(w >> 2 || 1, h >> 2 || 1, false, renderer);
      depthOnly = new T.MeshBasicMaterial({ colorWrite: false });
      /* AO without normals: for each pair of opposite taps the mid-point of
         their inverse depths is what a flat surface would give (1/z is affine
         in screen space for a plane), so only a real crease or a nearby
         occluder pushes the pair in front of the centre */
      mAO = shader(
        "uniform sampler2D tD;uniform float cn,cf,proj,rad;uniform vec2 res;varying vec2 vUv;" +
        "float lz(vec2 uv){float d=texture2D(tD,uv).x;return (cn*cf)/(cf-d*(cf-cn));}" +
        "float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}" +
        "void main(){float cz=lz(vUv);if(cz>cf*.9||cz<1.2){gl_FragColor=vec4(1.);return;}" +
        "float rpx=clamp(rad*proj/cz,2.,60.);float a0=hash(vUv*res)*6.2831;float occ=0.;float cnt=0.;" +
        "for(int i=0;i<6;i++){float a=a0+float(i)*1.0472;float r=rpx*(.45+.55*fract(float(i)*.618+hash(vUv.yx*res)));" +
        "vec2 o=vec2(cos(a),sin(a))*r/res;float z1=lz(vUv+o),z2=lz(vUv-o);" +
        "float dw=(1./z1+1./z2)*.5-1./cz;float dz=dw*cz*cz;" +
        "float rng=max(1.2,cz*.08);float ok=step(abs(z1-cz),rng)*step(abs(z2-cz),rng);" +
        "occ+=ok*smoothstep(.04+cz*.012,.5+cz*.02,dz)*(1.-smoothstep(1.4,3.,dz));cnt+=ok;}" +
        "occ/=max(cnt,1.);occ=pow(occ,.8);float fade=1.-smoothstep(cf*.25,cf*.6,cz);" +
        "gl_FragColor=vec4(vec3(1.-occ*fade),1.);}",
        { tD: { value: null }, cn: { value: 0.06 }, cf: { value: 320 }, proj: { value: 400 }, rad: { value: 0.95 }, res: { value: new T.Vector2() } });
      mAOBlur = shader(
        "uniform sampler2D tSrc;uniform vec2 dir;varying vec2 vUv;" +
        "void main(){float c=texture2D(tSrc,vUv).r*.3;c+=texture2D(tSrc,vUv+dir).r*.2;c+=texture2D(tSrc,vUv-dir).r*.2;" +
        "c+=texture2D(tSrc,vUv+dir*2.).r*.15;c+=texture2D(tSrc,vUv-dir*2.).r*.15;gl_FragColor=vec4(vec3(c),1.);}",
        { tSrc: { value: null }, dir: { value: new T.Vector2() } });
      /* sun shafts: march the bright pass toward the sun's screen point */
      mRays = shader(
        "uniform sampler2D tSrc;uniform vec2 sun;uniform float k;varying vec2 vUv;" +
        "void main(){vec2 d=(sun-vUv)/28.;vec2 uv=vUv;float w=1.;vec3 c=vec3(0.);" +
        "for(int i=0;i<28;i++){uv+=d;c+=texture2D(tSrc,clamp(uv,0.,1.)).rgb*w;w*=.94;}" +
        "gl_FragColor=vec4(c*k/10.,1.);}",
        { tSrc: { value: null }, sun: { value: new T.Vector2(0.5, 0.7) }, k: { value: 0 } });

      mBright = shader(
        "uniform sampler2D tSrc;uniform vec2 px;uniform float thr;varying vec2 vUv;" +
        "vec3 s(vec2 o){return texture2D(tSrc,vUv+o*px).rgb;}" +
        "void main(){vec3 c=(s(vec2(-1.,-1.))+s(vec2(1.,-1.))+s(vec2(-1.,1.))+s(vec2(1.,1.)))*.25;" +
        "float l=max(c.r,max(c.g,c.b));float k=smoothstep(thr,thr+.06,l);" +
        "gl_FragColor=vec4(c*k,1.);}",
        { tSrc: { value: null }, px: { value: new T.Vector2() }, thr: { value: 0.93 } });

      mBlur = shader(
        "uniform sampler2D tSrc;uniform vec2 dir;varying vec2 vUv;" +
        "void main(){vec3 c=texture2D(tSrc,vUv).rgb*.227027;" +
        "c+=texture2D(tSrc,vUv+dir*1.3846).rgb*.316216;c+=texture2D(tSrc,vUv-dir*1.3846).rgb*.316216;" +
        "c+=texture2D(tSrc,vUv+dir*3.2308).rgb*.070270;c+=texture2D(tSrc,vUv-dir*3.2308).rgb*.070270;" +
        "gl_FragColor=vec4(c,1.);}",
        { tSrc: { value: null }, dir: { value: new T.Vector2() } });

      mComp = shader(
        "uniform sampler2D tScene,tB,tC,tAO,tG;uniform float bloom,vig,aspect,aoK,hurt,raysK,dbg,sat,con;uniform vec3 tint;varying vec2 vUv;" +
        "void main(){vec2 sh=(vUv-.5)*hurt*.012;vec3 c=vec3(texture2D(tScene,vUv+sh).r,texture2D(tScene,vUv).g,texture2D(tScene,vUv-sh).b);" +
        "c*=mix(1.,texture2D(tAO,vUv).r,aoK);" +
        "c+=texture2D(tG,vUv).rgb*raysK;" +
        "vec3 b=texture2D(tB,vUv).rgb*.65+texture2D(tC,vUv).rgb*.55;" +
        /* screen-blend the glow so whites never clip into flat blocks */
        "c=1.-(1.-c)*(1.-b*bloom);" +
        /* grade: a touch of contrast and colour, cool shadows / warm highlights */
        "float l=dot(c,vec3(.2126,.7152,.0722));" +
        "c=mix(vec3(l),c,sat);" +
        /* (v46) contrast around a 0.45 pivot instead of 0.5, so the shadow end
           of a night street keeps its texture instead of being crushed to
           flat black, with a gentle S so the highlights stay round */
        "c=(c-.45)*con+.45;" +
        "c=mix(c, smoothstep(0.,1.,c), clamp((con-1.)*1.1,0.,.18));" +
        "c+=vec3(-.012,-.002,.016)*(1.-l)+vec3(.018,.008,-.014)*l+tint*(.11*(.5-l)+.05);" +
        /* vignette */
        "vec2 d=(vUv-.5)*vec2(aspect,1.);float r=length(d)/length(vec2(aspect,1.)*.5);" +
        "c*=1.-(vig+hurt*.35)*smoothstep(.55-hurt*.2,1.05,r);c=mix(c,c*vec3(1.25,.7,.65),hurt*.35*smoothstep(.4,1.,r));" +
        "if(dbg>.5)c=vec3(texture2D(tAO,vUv).r);gl_FragColor=vec4(clamp(c,0.,1.),1.);}",
        { tScene: { value: null }, tB: { value: null }, tC: { value: null }, tAO: { value: null }, tG: { value: null },
          bloom: { value: 0.6 }, vig: { value: 0.26 }, aspect: { value: 1 }, aoK: { value: 0 }, hurt: { value: 0 }, raysK: { value: 0 }, dbg: { value: 0 },
          sat: { value: 1.07 }, con: { value: 1.045 }, tint: { value: new T.Vector3(0.018, 0.008, -0.014) } });

      qCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      qScene = new T.Scene();
      quad = new T.Mesh(new T.PlaneGeometry(2, 2), mBright);
      quad.frustumCulled = false;
      qScene.add(quad);
      ready = true;
    } catch (err) {
      broken = true;
      level = "low";
      window.__postErr = String(err && err.stack || err);
    }
    return ready;
  }

  function resize(renderer) {
    if (!ready) return;
    renderer.getDrawingBufferSize(size);
    const w = Math.max(1, size.x), h = Math.max(1, size.y);
    rtScene.setSize(w, h);
    rtB0.setSize(w >> 2 || 1, h >> 2 || 1);
    rtB1.setSize(w >> 2 || 1, h >> 2 || 1);
    rtC0.setSize(w >> 3 || 1, h >> 3 || 1);
    rtC1.setSize(w >> 3 || 1, h >> 3 || 1);
    rtD.setSize(w >> 1 || 1, h >> 1 || 1);
    rtA0.setSize(w >> 1 || 1, h >> 1 || 1);
    rtA1.setSize(w >> 1 || 1, h >> 1 || 1);
    rtG.setSize(w >> 2 || 1, h >> 2 || 1);
  }

  function pass(renderer, mat, target) {
    quad.material = mat;
    renderer.setRenderTarget(target);
    renderer.render(qScene, qCam);
  }

  function render(renderer, scene, camera) {
    if (level !== "high" || !init(renderer)) {
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      return;
    }
    try {
      renderer.getDrawingBufferSize(size);
      if (rtScene.width !== size.x || rtScene.height !== size.y) resize(renderer);
      renderer.setRenderTarget(rtScene);
      renderer.clear();
      renderer.render(scene, camera);

      /* depth pre-pass at half resolution (no colour work), then the AO */
      let aoOk = false;
      if (FX.aoOn && FX.ao > 0) {
        const bg = scene.background, ov = scene.overrideMaterial, fog = scene.fog;
        scene.background = null; scene.overrideMaterial = depthOnly;
        renderer.setRenderTarget(rtD);
        renderer.clear();
        renderer.render(scene, camera);
        scene.background = bg; scene.overrideMaterial = ov; scene.fog = fog;
        mAO.uniforms.tD.value = rtD.depthTexture;
        mAO.uniforms.cn.value = camera.near; mAO.uniforms.cf.value = camera.far;
        mAO.uniforms.res.value.set(rtD.width, rtD.height);
        mAO.uniforms.proj.value = rtD.height / (2 * Math.tan((camera.fov * Math.PI) / 360));
        pass(renderer, mAO, rtA0);
        mAOBlur.uniforms.tSrc.value = rtA0.texture; mAOBlur.uniforms.dir.value.set(2.0 / rtA0.width, 0); pass(renderer, mAOBlur, rtA1);
        mAOBlur.uniforms.tSrc.value = rtA1.texture; mAOBlur.uniforms.dir.value.set(0, 2.0 / rtA0.height); pass(renderer, mAOBlur, rtA0);
        aoOk = true;
      }

      mBright.uniforms.tSrc.value = rtScene.texture;
      mBright.uniforms.px.value.set(1 / rtScene.width, 1 / rtScene.height);
      pass(renderer, mBright, rtB0);

      mBlur.uniforms.tSrc.value = rtB0.texture;
      mBlur.uniforms.dir.value.set(1 / rtB0.width, 0);
      pass(renderer, mBlur, rtB1);
      mBlur.uniforms.tSrc.value = rtB1.texture;
      mBlur.uniforms.dir.value.set(0, 1 / rtB0.height);
      pass(renderer, mBlur, rtB0);

      mBlur.uniforms.tSrc.value = rtB0.texture;
      mBlur.uniforms.dir.value.set(1 / rtC0.width, 0);
      pass(renderer, mBlur, rtC0);
      mBlur.uniforms.tSrc.value = rtC0.texture;
      mBlur.uniforms.dir.value.set(0, 1 / rtC0.height);
      pass(renderer, mBlur, rtC1);

      /* sun shafts from the bright pass, only while the sun is near the frame */
      let raysK = 0;
      const sd = window.__mgSunDir;
      if (FX.rays > 0 && sd) {
        const v = new T.Vector3(camera.position.x + sd.x * 200, camera.position.y + sd.y * 200, camera.position.z + sd.z * 200).project(camera);
        const camF = new T.Vector3(); camera.getWorldDirection(camF);
        const facing = camF.x * sd.x + camF.y * sd.y + camF.z * sd.z;
        if (facing > 0.15) {
          const sx = v.x * 0.5 + 0.5, sy = v.y * 0.5 + 0.5;
          const off = Math.max(0, Math.max(Math.abs(sx - 0.5), Math.abs(sy - 0.5)) - 0.5);
          raysK = FX.rays * Math.min(1, (facing - 0.15) / 0.4) * Math.max(0, 1 - off * 2.5);
          mRays.uniforms.sun.value.set(sx, sy);
        }
      }
      if (raysK > 0.01) {
        mRays.uniforms.tSrc.value = rtB0.texture; mRays.uniforms.k.value = 1;
        pass(renderer, mRays, rtG);
      }
      FX.hurt *= 0.9;
      mComp.uniforms.tAO.value = aoOk ? rtA0.texture : rtB0.texture;
      mComp.uniforms.aoK.value = aoOk ? FX.ao : 0;
      mComp.uniforms.tG.value = rtG.texture;
      mComp.uniforms.raysK.value = raysK > 0.01 ? raysK : 0;
      mComp.uniforms.hurt.value = Math.min(1, FX.hurt);
      mComp.uniforms.dbg.value = FX.dbg ? 1 : 0;
      /* the mood grade (v46): contrast, saturation and a colour cast per stage */
      mComp.uniforms.bloom.value = FX.bloom != null ? FX.bloom : TONE.bloom;
      mComp.uniforms.vig.value = FX.vig != null ? FX.vig : TONE.vig;
      mComp.uniforms.sat.value = TONE.sat;
      mComp.uniforms.con.value = TONE.con;
      mComp.uniforms.tint.value.set(TONE.tint[0], TONE.tint[1], TONE.tint[2]);
      mComp.uniforms.tScene.value = rtScene.texture;
      mComp.uniforms.tB.value = rtB0.texture;
      mComp.uniforms.tC.value = rtC1.texture;
      mComp.uniforms.aspect.value = rtScene.width / Math.max(1, rtScene.height);
      pass(renderer, mComp, null);
    } catch (err) {
      window.__postErr = String(err && err.stack || err);
      broken = true;
      level = "low";
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    }
  }

  /* auto: if a phone can't hold ~40 fps with the pass on, drop it once */
  let acc = 0, n = 0, slow = 0;
  function sample(dtMs) {
    if (pref !== "auto" || level !== "high") return;
    if (!(dtMs > 0) || dtMs > 250) return;
    acc += dtMs; n++;
    if (n < 90) return;
    const avg = acc / n;
    acc = 0; n = 0;
    slow = avg > 25 ? slow + 1 : 0;
    if (slow >= 2) { level = "low"; window.__postAuto = "low@" + avg.toFixed(1); fire(); }
  }

  const subs = [];
  function fire() { subs.forEach((f) => { try { f(level, pref); } catch (e) {} }); }

  function setQuality(q) {
    pref = q === "high" || q === "low" ? q : "auto";
    try { localStorage.setItem(KEY, pref); } catch (e) {}
    level = pref === "low" || broken ? "low" : "high";
    slow = 0; acc = 0; n = 0;
    fire();
  }

  window.MGPost = {
    render: render,
    resize: resize,
    sample: sample,
    setQuality: setQuality,
    onChange: (f) => subs.push(f),
    setTone: setTone,
    get tone() { return window.__tone || TONE; },
    get quality() { return level; },
    get pref() { return pref; },
    get mats() { return { mBright, mBlur, mComp }; },
    fx: FX,
    hurt: (k) => { FX.hurt = Math.min(1.5, FX.hurt + (k || 1)); }
  };
})();
