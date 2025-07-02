window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('babylon-canvas');
  if (!canvas) return;

  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

  engine.loadingScreen = {
    displayLoadingUI: function () {},
    hideLoadingUI: function () {}
  };

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

  // Camera
  const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2.2, 3.5, BABYLON.Vector3.Zero(), scene);
  camera.lowerRadiusLimit = camera.upperRadiusLimit = camera.radius;
  camera.panningSensibility = 0;
  camera.wheelPrecision = 0;

  // Lighting
  const light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);
  light1.intensity = 1.1;
  const light2 = new BABYLON.DirectionalLight('light2', new BABYLON.Vector3(-1, -2, -1), scene);
  light2.intensity = 1.2;

  // Load GLB model dan terapkan PBR diamond iced out dengan normal map dan albedo texture
  BABYLON.SceneLoader.Append('assets/3D/', 'sheva.glb', scene, function (scene) {
    // Parent node for rotation
    const parent = new BABYLON.TransformNode("rootRotator", scene);
    scene.meshes.forEach(mesh => {
      if (mesh && mesh.parent == null) {
        mesh.parent = parent;
      }
    });
    // PBR diamond iced out
    const pbr = new BABYLON.PBRMaterial("pbrDiamond", scene);
    pbr.reflectionTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://playground.babylonjs.com/textures/environment.env", scene);
    pbr.indexOfRefraction = 2.417;
    pbr.alpha = 0.7;
    pbr.directIntensity = 1.0;
    pbr.environmentIntensity = 2.0;
    pbr.cameraExposure = 0.7;
    pbr.cameraContrast = 1.6;
    pbr.microSurface = 0.98;
    pbr.reflectivityColor = new BABYLON.Color3(1, 1, 1);
    pbr.albedoColor = new BABYLON.Color3(1, 1, 1);
    // Tambahkan normal map
    pbr.bumpTexture = new BABYLON.Texture("assets/texture/Gliter_Normal.png", scene);
    // Tambahkan diamond.png sebagai albedoTexture
    pbr.albedoTexture = new BABYLON.Texture("assets/texture/diamond.png", scene);
    scene.meshes.forEach(mesh => {
      if (mesh.material) {
        mesh.material = pbr;
      }
    });
    // Efek interaktif hover kiri/kanan & atas/bawah
    let targetY = 0;
    let targetX = 0;
    let currentY = 0;
    let currentX = 0;
    let animating = false;
    let twinkleTime = 0;
    function animateRotation() {
      // Smooth rotasi
      if (Math.abs(currentY - targetY) > 0.01) {
        currentY += (targetY - currentY) * 0.15;
        animating = true;
      } else if (animating) {
        currentY = targetY;
        animating = false;
      }
      if (Math.abs(currentX - targetX) > 0.01) {
        currentX += (targetX - currentX) * 0.15;
      } else {
        currentX = targetX;
      }
      parent.rotation.y = currentY;
      parent.rotation.x = currentX;
      // Efek twinkle selalu aktif
      twinkleTime += 0.08;
      const tw = 0.7 + 0.3 * Math.abs(Math.sin(twinkleTime * 8)) * Math.random();
      pbr.emissiveColor = new BABYLON.Color3(tw, tw, tw);
      requestAnimationFrame(animateRotation);
    }
    animateRotation();
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      // Kiri/kanan
      if (x < midX) {
        targetY = 0.35;
      } else {
        targetY = -0.35;
      }
      // Atas/bawah
      if (y < midY) {
        targetX = -0.25;
      } else {
        targetX = 0.25;
      }
    });
    canvas.addEventListener('mouseleave', () => {
      targetY = 0;
      targetX = 0;
    });
  }, null, function (scene, message) {
    console.error('Error loading 3D model:', message);
  });

  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener('resize', function () {
    engine.resize();
  });
});
