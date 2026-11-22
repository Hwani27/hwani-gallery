/* post.js — screen pass for 지금 바로 멸공 (three.js r128, no examples/ files)

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
  let quad = null, qScene = null, qCam = null;
  let mBright = null, mBlur = null, mComp = null;
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
        "uniform sampler2D tScene,tB,tC;uniform float bloom,vig,aspect;varying vec2 vUv;" +
        "void main(){vec3 c=texture2D(tScene,vUv).rgb;" +
        "vec3 b=texture2D(tB,vUv).rgb*.65+texture2D(tC,vUv).rgb*.55;" +
        /* screen-blend the glow so whites never clip into flat blocks */
        "c=1.-(1.-c)*(1.-b*bloom);" +
        /* grade: a touch of contrast and colour, cool shadows / warm highlights */
        "float l=dot(c,vec3(.2126,.7152,.0722));" +
        "c=mix(vec3(l),c,1.07);" +
        "c=(c-.5)*1.045+.5;" +
        "c+=vec3(-.012,-.002,.016)*(1.-l)+vec3(.018,.008,-.014)*l;" +
        /* vignette */
        "vec2 d=(vUv-.5)*vec2(aspect,1.);float r=length(d)/length(vec2(aspect,1.)*.5);" +
        "c*=1.-vig*smoothstep(.55,1.05,r);" +
        "gl_FragColor=vec4(clamp(c,0.,1.),1.);}",
        { tScene: { value: null }, tB: { value: null }, tC: { value: null },
          bloom: { value: 0.6 }, vig: { value: 0.26 }, aspect: { value: 1 } });

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
    get quality() { return level; },
    get pref() { return pref; },
    get mats() { return { mBright, mBlur, mComp }; }
  };
})();
