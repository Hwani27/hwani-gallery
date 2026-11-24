/* test-only: a Kenney blocky character dressed for the game */
window.makeKChar = function (g, texUrl, kit, anim, t) {
  const T = THREE;
  const root = g.scene.clone(true);
  const tx = new T.TextureLoader().load(texUrl);
  tx.flipY = false; tx.encoding = T.sRGBEncoding; tx.magFilter = T.NearestFilter; tx.minFilter = T.LinearMipmapLinearFilter;
  root.traverse((o) => { if (o.isMesh) { const m0 = o.material; if (m0.map) { tx.offset.copy(m0.map.offset); tx.repeat.copy(m0.map.repeat); tx.wrapS = tx.wrapT = T.RepeatWrapping; } o.material = new T.MeshStandardMaterial({ map: tx, roughness: 0.92 }); o.castShadow = true; o.receiveShadow = true; } });
  root.scale.setScalar(1.75 / 2.7);
  const box = (w, h, d, x, y, z, c, par) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshStandardMaterial({ color: new T.Color(c).convertSRGBToLinear(), roughness: 0.85 })); m.position.set(x, y, z); m.castShadow = true; par.add(m); return m; };
  let R = null;
  const head = root.getObjectByName('head'), arm = root.getObjectByName('arm-right');
  if (kit === 'e' || kit === 'a') {
    const hc = kit === 'e' ? '#4a5430' : '#56603a';
    box(9.0, 3.0, 9.0, 0, 9.4, 0, hc, head); box(8.2, 0.9, 8.2, 0, 11.1, 0, hc, head); box(9.8, 0.7, 9.8, 0, 7.9, 0, hc, head);
    box(0.35, 3.0, 0.35, 4.55, 6.9, 1.2, '#3a3222', head); box(0.35, 3.0, 0.35, -4.55, 6.9, 1.2, '#3a3222', head);
    if (kit === 'a') for (let k = 0; k < 4; k++) box(9.3, 0.25, 0.3, 0, 8.8 + k * 0.7, 4.5, '#3e4428', head);
    R = new T.Group(); root.add(R);
    box(0.13, 0.55, 0.2, 0, 0.28, 0, '#6b4a2c', R); box(0.12, 0.62, 0.16, 0, -0.3, 0, '#7a5634', R);
    box(0.09, 0.95, 0.09, 0, -0.45, -0.04, '#2a2a2a', R); box(0.14, 0.3, 0.15, 0, 0.0, -0.02, '#33302c', R); box(0.07, 0.18, 0.12, 0, 0.05, 0.13, '#2a2a2a', R);
  }
  const torso = root.getObjectByName('torso');
  if (kit === 'r') {
    const hc = '#4f5538';
    box(9.6, 3.4, 9.8, 0, 9.5, 0, hc, head); box(8.6, 1.0, 8.8, 0, 11.6, 0, hc, head); box(10.0, 0.6, 10.2, 0, 7.9, 0, '#454a31', head);
    box(0.5, 1.2, 6.0, 4.95, 9.0, 0, '#2c2c26', head); box(0.5, 1.2, 6.0, -4.95, 9.0, 0, '#2c2c26', head);   // side rails
    box(1.8, 1.4, 0.9, 0, 10.2, 5.0, '#2a2a26', head);                                                        // NVG mount
    box(0.3, 3.0, 0.3, 4.6, 6.8, 1.6, '#202020', head); box(0.3, 3.0, 0.3, -4.6, 6.8, 1.6, '#202020', head);
    box(0.86, 0.5, 0.09, 0, 0.88, 0.33, '#4c5236', torso); box(0.86, 0.5, 0.09, 0, 0.88, -0.33, '#4c5236', torso);
    for (let k = 0; k < 3; k++) box(0.2, 0.2, 0.12, -0.24 + k * 0.24, 0.66, 0.42, '#3d422b', torso);
    box(0.18, 0.14, 0.1, 0.27, 0.98, 0.41, '#3d422b', torso);
  }
  if (kit === 'n') {
    const hc = '#4b5232';
    box(9.2, 3.8, 9.4, 0, 9.7, 0, hc, head); box(8.0, 1.0, 8.2, 0, 12.0, 0, hc, head); box(9.8, 0.5, 10.0, 0, 7.7, 0, '#434929', head);
    box(0.3, 3.2, 0.3, 4.5, 6.6, 1.0, '#5a3e24', head); box(0.3, 3.2, 0.3, -4.5, 6.6, 1.0, '#5a3e24', head);
    box(0.16, 0.42, 0.12, -0.28, 0.8, 0.34, '#5a4a2c', torso); box(0.16, 0.42, 0.12, 0.28, 0.8, 0.34, '#5a4a2c', torso); // chest mag pouches
  }
  if (kit === 'r' || kit === 'n') {
    R = new T.Group(); root.add(R);
    if (kit === 'r') {
      box(0.12, 0.42, 0.18, 0, 0.32, 0.02, '#1e1e1e', R);   // stock
      box(0.13, 0.5, 0.17, 0, -0.08, 0, '#242424', R);      // receiver
      box(0.11, 0.42, 0.14, 0, -0.52, 0, '#2c2c2a', R);     // handguard
      box(0.06, 0.3, 0.06, 0, -0.85, 0.0, '#111', R);       // barrel
      box(0.09, 0.14, 0.24, 0, -0.08, -0.17, '#1a1a1a', R); // magazine
      box(0.08, 0.18, 0.1, 0, -0.16, 0.13, '#111', R);      // optic
    } else {
      box(0.12, 0.42, 0.17, 0, 0.32, 0.02, '#6b4529', R);   // wood stock
      box(0.13, 0.36, 0.15, 0, -0.04, 0, '#2a2622', R);     // receiver
      box(0.11, 0.3, 0.13, 0, -0.38, 0, '#74492b', R);      // wood handguard
      box(0.055, 0.5, 0.055, 0, -0.7, 0.02, '#151515', R);  // barrel
      const mg = box(0.08, 0.1, 0.26, 0, -0.1, -0.17, '#2a2622', R); mg.rotation.x = -0.35;   // curved mag, two pieces
      const mg2 = box(0.08, 0.1, 0.16, 0, -0.17, -0.33, '#2a2622', R); mg2.rotation.x = -0.75;
    }
  }
  const mx = new T.AnimationMixer(root);
  const cl = T.AnimationClip.findByName(g.animations, anim); if (cl) mx.clipAction(cl).play();
  const upd = (dt) => {
    mx.update(dt);
    if (R) { root.updateMatrixWorld(true); const hp = arm.localToWorld(new T.Vector3(-0.2, -0.92, 0.05)); root.worldToLocal(hp); R.position.copy(hp); R.position.y -= 0.05; R.position.z += 0.25; R.rotation.set(-Math.PI / 2 + 0.08, 0, 0); }
  };
  upd(t == null ? 0.3 : t);
  return { root, upd };
};
