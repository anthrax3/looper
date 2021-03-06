import THREE from '../third_party/three.js';
import {renderer, getCamera} from '../modules/three.js';
import Maf from '../modules/maf.js';
import easings from '../modules/easings.js';
import noise from '../third_party/perlin.js';
import RoundedBoxGeometry from '../third_party/three-rounded-box.js';
import {palette2 as palette} from '../modules/floriandelooij.js';

palette.range = ["#DE2704", "#F89149", "#FCCB8A", "#CA4710",]
const canvas = renderer.domElement;
const camera = getCamera();
const scene = new THREE.Scene();
const group = new THREE.Group();

const objects = [];

const RINGS = 40;
const OBJECTS = 16;
const geo = new RoundedBoxGeometry(.1,.25,.25,.025,4);
const mats = [
  new THREE.MeshStandardMaterial({color: palette.range[2], metalness: .1, roughness: .25}),
  new THREE.MeshStandardMaterial({color: palette.range[1], metalness: .1, roughness: .25}),
  new THREE.MeshStandardMaterial({color: palette.range[2], metalness: .1, roughness: .25}),
  new THREE.MeshStandardMaterial({color: palette.range[3], metalness: .1, roughness: .25}),
  new THREE.MeshStandardMaterial({color: palette.range[4], metalness: .1, roughness: .25}),
  new THREE.MeshStandardMaterial({color: palette.range[5], metalness: .1, roughness: .25}),
];

for (let j=0; j<RINGS; j++) {
  const pivot = new THREE.Group();
  const meshes = [];
  const centers = [];

  for (let k=0; k<OBJECTS; k++) {
    const mesh = new THREE.Mesh(geo,mats[Math.floor(Math.random()*mats.length)]);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.scale.x = Maf.randomInRange(.5,5);
    mesh.userData.scale = mesh.scale.x;
    pivot.add(mesh);
    meshes.push(mesh);
  }

  objects.push({meshes, pivot});
  group.add(pivot);
}
group.scale.setScalar(.75);
scene.add(group);

const directionalLight = new THREE.DirectionalLight( 0xffffff, .5 );
directionalLight.position.set(-2,2,2);
directionalLight.castShadow = true;
scene.add( directionalLight );

const directionalLight2 = new THREE.DirectionalLight( 0xffffff, .5 );
directionalLight2.position.set(1,2,1);
directionalLight2.castShadow = true;
scene.add( directionalLight2 );

const ambientLight = new THREE.AmbientLight(0x808080, .5);
scene.add(ambientLight);

const light = new THREE.HemisphereLight( 0xcefeff, 0xb3eaf0, .5 );
scene.add( light );

camera.position.set(0,6,6);
camera.lookAt(new THREE.Vector3(0,0,0));
camera.rotation.z = 3*Math.PI/4;
renderer.setClearColor(palette.base[0],1);
scene.fog = new THREE.FogExp2( palette.base[0], 0.05 );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const loopDuration = 4;
const cameraOffset = new THREE.Vector3();

function draw(startTime) {

  const time = ( .001 * (performance.now()-startTime)) % loopDuration;
  const t = time / loopDuration;

  objects.forEach( (o, id) => {
    const a = id * Maf.TAU / objects.length;
    const r = 2;
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);

    o.pivot.position.set(x,y,0);
    o.pivot.rotation.z = a;

    o.meshes.forEach( (m, mid) => {
      const a2 = id * Maf.TAU / RINGS + t * Maf.TAU + mid * Maf.TAU / OBJECTS;
      const r2 = .5 + .5 * Math.sin(a2);
      const x2 = r2 * Math.cos(a2);
      const y2 = r2 * Math.sin(a2);
      m.rotation.y = -a2;
      m.position.set(x2,0,y2);
      const d = Math.sqrt(x2*x2+y2*y2);
      const s = Maf.parabola(Maf.mod(2*t+3*id/RINGS + mid / OBJECTS,1),4);
      const ss = (s*(.15*Math.pow(d*5,1.3)));
      m.scale.z = m.scale.y = ss;
      m.scale.x = m.userData.scale * ss;
    });

  });

  renderer.render(scene, camera);
}

export { draw, loopDuration, canvas };
