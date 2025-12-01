// Ballpit Component - Vanilla JavaScript Version
// Component inspired by Kevin Levron: https://x.com/soju22/status/1858925191671271801

import {
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  SRGBColorSpace,
  MathUtils,
  Vector2,
  Vector3,
  MeshPhysicalMaterial,
  ShaderChunk,
  Color,
  Object3D,
  InstancedMesh,
  PMREMGenerator,
  SphereGeometry,
  AmbientLight,
  PointLight,
  ACESFilmicToneMapping,
  Raycaster,
  Plane
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

class ThreeApp {
  #config;
  canvas;
  camera;
  cameraMinAspect;
  cameraMaxAspect;
  cameraFov;
  maxPixelRatio;
  minPixelRatio;
  scene;
  renderer;
  #postprocessing;
  size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  render = this.#defaultRender;
  onBeforeRender = () => {};
  onAfterRender = () => {};
  onAfterResize = () => {};
  #isIntersecting = false;
  #isRendering = false;
  isDisposed = false;
  #intersectionObserver;
  #resizeObserver;
  #resizeTimeout;
  #clock = new Clock();
  #time = { elapsed: 0, delta: 0 };
  #rafId;

  constructor(config) {
    this.#config = { ...config };
    this.#initCamera();
    this.#initScene();
    this.#initRenderer();
    this.resize();
    this.#initObservers();
  }

  #initCamera() {
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
  }

  #initScene() {
    this.scene = new Scene();
  }

  #initRenderer() {
    if (this.#config.canvas) {
      this.canvas = this.#config.canvas;
    } else if (this.#config.id) {
      this.canvas = document.getElementById(this.#config.id);
    } else {
      console.error('Three: Missing canvas or id parameter');
    }
    this.canvas.style.display = 'block';
    const options = {
      canvas: this.canvas,
      powerPreference: 'high-performance',
      ...(this.#config.rendererOptions ?? {})
    };
    this.renderer = new WebGLRenderer(options);
    this.renderer.outputColorSpace = SRGBColorSpace;
  }

  #initObservers() {
    if (!(this.#config.size instanceof Object)) {
      window.addEventListener('resize', this.#onResize.bind(this));
      if (this.#config.size === 'parent' && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this));
        this.#resizeObserver.observe(this.canvas.parentNode);
      }
    }
    this.#intersectionObserver = new IntersectionObserver(this.#onIntersect.bind(this), {
      root: null,
      rootMargin: '0px',
      threshold: 0
    });
    this.#intersectionObserver.observe(this.canvas);
    document.addEventListener('visibilitychange', this.#onVisibilityChange.bind(this));
  }

  #removeObservers() {
    window.removeEventListener('resize', this.#onResize.bind(this));
    this.#resizeObserver?.disconnect();
    this.#intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.#onVisibilityChange.bind(this));
  }

  #onIntersect(entries) {
    this.#isIntersecting = entries[0].isIntersecting;
    this.#isIntersecting ? this.#startRendering() : this.#stopRendering();
  }

  #onVisibilityChange() {
    if (this.#isIntersecting) {
      document.hidden ? this.#stopRendering() : this.#startRendering();
    }
  }

  #onResize() {
    if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout);
    this.#resizeTimeout = setTimeout(this.resize.bind(this), 100);
  }

  resize() {
    let width, height;
    if (this.#config.size instanceof Object) {
      width = this.#config.size.width;
      height = this.#config.size.height;
    } else if (this.#config.size === 'parent' && this.canvas.parentNode) {
      width = this.canvas.parentNode.offsetWidth;
      height = this.canvas.parentNode.offsetHeight;
    } else {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    this.size.width = width;
    this.size.height = height;
    this.size.ratio = width / height;
    this.#updateCamera();
    this.#updateRenderer();
    this.onAfterResize(this.size);
  }

  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#adjustFOV(this.cameraMinAspect);
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#adjustFOV(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }

  #adjustFOV(targetAspect) {
    const tan = Math.tan(MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / targetAspect);
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(tan));
  }

  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fov = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(fov / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    } else if (this.camera.isOrthographicCamera) {
      this.size.wHeight = this.camera.top - this.camera.bottom;
      this.size.wWidth = this.camera.right - this.camera.left;
    }
  }

  #updateRenderer() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.#postprocessing?.setSize(this.size.width, this.size.height);
    let pixelRatio = window.devicePixelRatio;
    if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) {
      pixelRatio = this.maxPixelRatio;
    } else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) {
      pixelRatio = this.minPixelRatio;
    }
    this.renderer.setPixelRatio(pixelRatio);
    this.size.pixelRatio = pixelRatio;
  }

  get postprocessing() {
    return this.#postprocessing;
  }

  set postprocessing(value) {
    this.#postprocessing = value;
    this.render = value.render.bind(value);
  }

  #startRendering() {
    if (this.#isRendering) return;
    const animate = () => {
      this.#rafId = requestAnimationFrame(animate);
      this.#time.delta = this.#clock.getDelta();
      this.#time.elapsed += this.#time.delta;
      this.onBeforeRender(this.#time);
      this.render();
      this.onAfterRender(this.#time);
    };
    this.#isRendering = true;
    this.#clock.start();
    animate();
  }

  #stopRendering() {
    if (this.#isRendering) {
      cancelAnimationFrame(this.#rafId);
      this.#isRendering = false;
      this.#clock.stop();
    }
  }

  #defaultRender() {
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.scene.traverse(obj => {
      if (obj.isMesh && typeof obj.material === 'object' && obj.material !== null) {
        Object.keys(obj.material).forEach(key => {
          const value = obj.material[key];
          if (value !== null && typeof value === 'object' && typeof value.dispose === 'function') {
            value.dispose();
          }
        });
        obj.material.dispose();
        obj.geometry.dispose();
      }
    });
    this.scene.clear();
  }

  dispose() {
    this.#removeObservers();
    this.#stopRendering();
    this.clear();
    this.#postprocessing?.dispose();
    this.renderer.dispose();
    this.isDisposed = true;
  }
}

const pointerMap = new Map();
const pointerPosition = new Vector2();
let isListening = false;

function createPointer(config) {
  const pointer = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter() {},
    onMove() {},
    onClick() {},
    onLeave() {},
    ...config
  };

  registerPointer(config.domElement, pointer);

  pointer.dispose = () => {
    const element = config.domElement;
    pointerMap.delete(element);
    if (pointerMap.size === 0) {
      removeListeners();
    }
  };

  return pointer;
}

function registerPointer(element, pointer) {
  if (!pointerMap.has(element)) {
    pointerMap.set(element, pointer);
    if (!isListening) {
      addListeners();
      isListening = true;
    }
  }
}

function addListeners() {
  document.body.addEventListener('pointermove', onPointerMove);
  document.body.addEventListener('pointerleave', onPointerLeave);
  document.body.addEventListener('click', onPointerClick);
  document.body.addEventListener('touchstart', onTouchStart, { passive: false });
  document.body.addEventListener('touchmove', onTouchMove, { passive: false });
  document.body.addEventListener('touchend', onTouchEnd, { passive: false });
  document.body.addEventListener('touchcancel', onTouchEnd, { passive: false });
}

function removeListeners() {
  document.body.removeEventListener('pointermove', onPointerMove);
  document.body.removeEventListener('pointerleave', onPointerLeave);
  document.body.removeEventListener('click', onPointerClick);
  document.body.removeEventListener('touchstart', onTouchStart);
  document.body.removeEventListener('touchmove', onTouchMove);
  document.body.removeEventListener('touchend', onTouchEnd);
  document.body.removeEventListener('touchcancel', onTouchEnd);
  isListening = false;
}

function onPointerMove(event) {
  pointerPosition.x = event.clientX;
  pointerPosition.y = event.clientY;
  processInteraction();
}

function processInteraction() {
  for (const [element, pointer] of pointerMap) {
    const rect = element.getBoundingClientRect();
    if (isInside(rect)) {
      updatePointerPosition(pointer, rect);
      if (!pointer.hover) {
        pointer.hover = true;
        pointer.onEnter(pointer);
      }
      pointer.onMove(pointer);
    } else if (pointer.hover && !pointer.touching) {
      pointer.hover = false;
      pointer.onLeave(pointer);
    }
  }
}

function onPointerClick(event) {
  pointerPosition.x = event.clientX;
  pointerPosition.y = event.clientY;
  for (const [element, pointer] of pointerMap) {
    const rect = element.getBoundingClientRect();
    updatePointerPosition(pointer, rect);
    if (isInside(rect)) pointer.onClick(pointer);
  }
}

function onPointerLeave() {
  for (const pointer of pointerMap.values()) {
    if (pointer.hover) {
      pointer.hover = false;
      pointer.onLeave(pointer);
    }
  }
}

function onTouchStart(event) {
  if (event.touches.length > 0) {
    event.preventDefault();
    pointerPosition.x = event.touches[0].clientX;
    pointerPosition.y = event.touches[0].clientY;
    for (const [element, pointer] of pointerMap) {
      const rect = element.getBoundingClientRect();
      if (isInside(rect)) {
        pointer.touching = true;
        updatePointerPosition(pointer, rect);
        if (!pointer.hover) {
          pointer.hover = true;
          pointer.onEnter(pointer);
        }
        pointer.onMove(pointer);
      }
    }
  }
}

function onTouchMove(event) {
  if (event.touches.length > 0) {
    event.preventDefault();
    pointerPosition.x = event.touches[0].clientX;
    pointerPosition.y = event.touches[0].clientY;
    for (const [element, pointer] of pointerMap) {
      const rect = element.getBoundingClientRect();
      updatePointerPosition(pointer, rect);
      if (isInside(rect)) {
        if (!pointer.hover) {
          pointer.hover = true;
          pointer.touching = true;
          pointer.onEnter(pointer);
        }
        pointer.onMove(pointer);
      } else if (pointer.hover && pointer.touching) {
        pointer.onMove(pointer);
      }
    }
  }
}

function onTouchEnd() {
  for (const pointer of pointerMap.values()) {
    if (pointer.touching) {
      pointer.touching = false;
      if (pointer.hover) {
        pointer.hover = false;
        pointer.onLeave(pointer);
      }
    }
  }
}

function updatePointerPosition(pointer, rect) {
  const { position, nPosition } = pointer;
  position.x = pointerPosition.x - rect.left;
  position.y = pointerPosition.y - rect.top;
  nPosition.x = (position.x / rect.width) * 2 - 1;
  nPosition.y = (-position.y / rect.height) * 2 + 1;
}

function isInside(rect) {
  const { x, y } = pointerPosition;
  const { left, top, width, height } = rect;
  return x >= left && x <= left + width && y >= top && y <= top + height;
}

const { randFloat, randFloatSpread } = MathUtils;
const tempVec1 = new Vector3();
const tempVec2 = new Vector3();
const tempVec3 = new Vector3();
const tempVel1 = new Vector3();
const tempVel2 = new Vector3();
const diff = new Vector3();
const correction = new Vector3();
const velCorrection1 = new Vector3();
const velCorrection2 = new Vector3();
const sphere0Pos = new Vector3();

class Physics {
  constructor(config) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.center = new Vector3();
    this.#initPositions();
    this.setSizes();
  }

  #initPositions() {
    const { config, positionData } = this;
    this.center.toArray(positionData, 0);
    for (let i = 1; i < config.count; i++) {
      const idx = 3 * i;
      positionData[idx] = randFloatSpread(2 * config.maxX);
      positionData[idx + 1] = randFloatSpread(2 * config.maxY);
      positionData[idx + 2] = randFloatSpread(2 * config.maxZ);
    }
  }

  setSizes() {
    const { config, sizeData } = this;
    sizeData[0] = config.size0;
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = randFloat(config.minSize, config.maxSize);
    }
  }

  update(time) {
    const { config, center, positionData, sizeData, velocityData } = this;
    let startIdx = 0;

    // Update sphere 0 (controlled sphere)
    if (config.controlSphere0) {
      startIdx = 1;
      sphere0Pos.fromArray(positionData, 0);
      sphere0Pos.lerp(center, 0.1).toArray(positionData, 0);
      tempVel1.set(0, 0, 0).toArray(velocityData, 0);
    }

    // Apply gravity and friction
    for (let i = startIdx; i < config.count; i++) {
      const idx = 3 * i;
      tempVec1.fromArray(positionData, idx);
      tempVel1.fromArray(velocityData, idx);
      tempVel1.y -= time.delta * config.gravity * sizeData[i];
      tempVel1.multiplyScalar(config.friction);
      tempVel1.clampLength(0, config.maxVelocity);
      tempVec1.add(tempVel1);
      tempVec1.toArray(positionData, idx);
      tempVel1.toArray(velocityData, idx);
    }

    // Sphere-to-sphere collisions
    for (let i = startIdx; i < config.count; i++) {
      const idx1 = 3 * i;
      tempVec1.fromArray(positionData, idx1);
      tempVel1.fromArray(velocityData, idx1);
      const radius1 = sizeData[i];

      for (let j = i + 1; j < config.count; j++) {
        const idx2 = 3 * j;
        tempVec2.fromArray(positionData, idx2);
        tempVel2.fromArray(velocityData, idx2);
        const radius2 = sizeData[j];

        diff.copy(tempVec2).sub(tempVec1);
        const distance = diff.length();
        const sumRadius = radius1 + radius2;

        if (distance < sumRadius) {
          const overlap = sumRadius - distance;
          correction.copy(diff)
            .normalize()
            .multiplyScalar(0.5 * overlap);
          velCorrection1.copy(correction).multiplyScalar(Math.max(tempVel1.length(), 1));
          velCorrection2.copy(correction).multiplyScalar(Math.max(tempVel2.length(), 1));

          tempVec1.sub(correction);
          tempVel1.sub(velCorrection1);
          tempVec1.toArray(positionData, idx1);
          tempVel1.toArray(velocityData, idx1);

          tempVec2.add(correction);
          tempVel2.add(velCorrection2);
          tempVec2.toArray(positionData, idx2);
          tempVel2.toArray(velocityData, idx2);
        }
      }

      // Collision with sphere 0
      if (config.controlSphere0) {
        diff.copy(sphere0Pos).sub(tempVec1);
        const distance = diff.length();
        const sumRadius = radius1 + sizeData[0];

        if (distance < sumRadius) {
          const overlap = sumRadius - distance;
          correction.copy(diff.normalize()).multiplyScalar(overlap);
          velCorrection1.copy(correction).multiplyScalar(Math.max(tempVel1.length(), 2));
          tempVec1.sub(correction);
          tempVel1.sub(velCorrection1);
        }
      }

      // Wall collisions
      if (Math.abs(tempVec1.x) + radius1 > config.maxX) {
        tempVec1.x = Math.sign(tempVec1.x) * (config.maxX - radius1);
        tempVel1.x = -tempVel1.x * config.wallBounce;
      }

      if (config.gravity === 0) {
        if (Math.abs(tempVec1.y) + radius1 > config.maxY) {
          tempVec1.y = Math.sign(tempVec1.y) * (config.maxY - radius1);
          tempVel1.y = -tempVel1.y * config.wallBounce;
        }
      } else if (tempVec1.y - radius1 < -config.maxY) {
        tempVec1.y = -config.maxY + radius1;
        tempVel1.y = -tempVel1.y * config.wallBounce;
      }

      const maxBoundary = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(tempVec1.z) + radius1 > maxBoundary) {
        tempVec1.z = Math.sign(tempVec1.z) * (config.maxZ - radius1);
        tempVel1.z = -tempVel1.z * config.wallBounce;
      }

      tempVec1.toArray(positionData, idx1);
      tempVel1.toArray(velocityData, idx1);
    }
  }
}

class SubsurfaceMaterial extends MeshPhysicalMaterial {
  constructor(config) {
    super(config);
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 }
    };
    this.defines.USE_UV = '';
    this.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader =
        `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }

        void main() {
      `
      );
      const lightsFragment = ShaderChunk.lights_fragment_begin.replaceAll(
        'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
        `
          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightsFragment);
      if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
    };
  }
}

const defaultConfig = {
  count: 70,
  colors: [0, 0, 0],
  ambientColor: 0xffffff,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: {
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.15
  },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true
};

const dummy = new Object3D();

class Spheres extends InstancedMesh {
  constructor(renderer, userConfig = {}) {
    const config = { ...defaultConfig, ...userConfig };
    const envScene = new RoomEnvironment();
    const envMap = new PMREMGenerator(renderer, 0.04).fromScene(envScene).texture;
    const geometry = new SphereGeometry();
    const material = new SubsurfaceMaterial({ envMap, ...config.materialParams });
    material.envMapRotation.x = -Math.PI / 2;
    super(geometry, material, config.count);

    this.config = config;
    this.physics = new Physics(config);
    this.#initLights();
    this.setColors(config.colors);
  }

  #initLights() {
    this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }

  setColors(colors) {
    if (Array.isArray(colors) && colors.length > 1) {
      const gradient = createGradient(colors);
      for (let i = 0; i < this.count; i++) {
        this.setColorAt(i, gradient.getColorAt(i / this.count));
        if (i === 0) {
          this.light.color.copy(gradient.getColorAt(i / this.count));
        }
      }
      this.instanceColor.needsUpdate = true;
    }
  }

  update(time) {
    this.physics.update(time);
    for (let i = 0; i < this.count; i++) {
      dummy.position.fromArray(this.physics.positionData, 3 * i);
      if (i === 0 && this.config.followCursor === false) {
        dummy.scale.setScalar(0);
      } else {
        dummy.scale.setScalar(this.physics.sizeData[i]);
      }
      dummy.updateMatrix();
      this.setMatrixAt(i, dummy.matrix);
      if (i === 0) this.light.position.copy(dummy.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

function createGradient(colors) {
  let colorArray = colors;
  let colorObjects = [];

  function setColors(colors) {
    colorArray = colors;
    colorObjects = [];
    colorArray.forEach(color => {
      colorObjects.push(new Color(color));
    });
  }

  setColors(colors);

  return {
    setColors,
    getColorAt: function (ratio, out = new Color()) {
      const scaled = Math.max(0, Math.min(1, ratio)) * (colorArray.length - 1);
      const idx = Math.floor(scaled);
      const start = colorObjects[idx];
      if (idx >= colorArray.length - 1) return start.clone();
      const alpha = scaled - idx;
      const end = colorObjects[idx + 1];
      out.r = start.r + alpha * (end.r - start.r);
      out.g = start.g + alpha * (end.g - start.g);
      out.b = start.b + alpha * (end.b - start.b);
      return out;
    }
  };
}

export function createBallpit(canvas, userConfig = {}) {
  const app = new ThreeApp({
    canvas: canvas,
    size: 'parent',
    rendererOptions: { antialias: true, alpha: true }
  });

  let spheres;
  app.renderer.toneMapping = ACESFilmicToneMapping;
  app.camera.position.set(0, 0, 20);
  app.camera.lookAt(0, 0, 0);
  app.cameraMaxAspect = 1.5;
  app.resize();

  initialize(userConfig);

  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const intersection = new Vector3();
  let isPaused = false;

  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  canvas.style.webkitUserSelect = 'none';

  const pointer = createPointer({
    domElement: canvas,
    onMove() {
      raycaster.setFromCamera(pointer.nPosition, app.camera);
      app.camera.getWorldDirection(plane.normal);
      raycaster.ray.intersectPlane(plane, intersection);
      spheres.physics.center.copy(intersection);
      spheres.config.controlSphere0 = true;
    },
    onLeave() {
      spheres.config.controlSphere0 = false;
    }
  });

  function initialize(config) {
    if (spheres) {
      app.clear();
      app.scene.remove(spheres);
    }
    spheres = new Spheres(app.renderer, config);
    app.scene.add(spheres);
  }

  app.onBeforeRender = (time) => {
    if (!isPaused) spheres.update(time);
  };

  app.onAfterResize = (size) => {
    spheres.config.maxX = size.wWidth / 2;
    spheres.config.maxY = size.wHeight / 2;
  };

  return {
    three: app,
    get spheres() {
      return spheres;
    },
    setCount(count) {
      initialize({ ...spheres.config, count });
    },
    togglePause() {
      isPaused = !isPaused;
    },
    dispose() {
      pointer.dispose();
      app.dispose();
    }
  };
}
