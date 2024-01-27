const SHAPES = [
	new THREE.BoxGeometry(1.5, 1.5, 1.5),
	new THREE.ConeGeometry(1, 2, 8),
	new THREE.CylinderGeometry(0.8, 0.8, 1.6, 16),
	new THREE.SphereGeometry(1, 16, 8),
	new THREE.TorusGeometry(1, 0.2, 8, 16),
]
const OBJECT_COLORS = [
	0x3498db,
	0x2ecc71,
	0xe74c3c,
	0x9b59b6,
	0xf1c40f,
]
console.assert(OBJECT_COLORS.length == SHAPES.length);

const LINE_COLOR = 0xecf0f1;
const BACKGROUND_COLOR = 0x222222;
const NUM_OBJECTS = SHAPES.length;

const ANIMATION_LOOP_TIME = 10;
const ANIMATION_NUM_OBJECT_LAYERS = 5;
const ANIMATION_RADIUS = 10;


// setup ThreeJS
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
scene.background = new THREE.Color(BACKGROUND_COLOR);


// create and add objects to scene
let objects = [];
for (let l = 0; l < ANIMATION_NUM_OBJECT_LAYERS; l++) {
	for (let o = 0; o < NUM_OBJECTS; o++) {
		const object = createObjectWithEdges(
			SHAPES[o],
			new THREE.MeshBasicMaterial({ color: OBJECT_COLORS[o] }),
		);
		objects.push(object);
		scene.add(object);
	}
}

camera.position.z = 20;
camera.lookAt(0, 0, 0);

// add circular grid for visual reference
const circularGrid = new THREE.LineSegments(
	new THREE.WireframeGeometry(new THREE.CircleGeometry(30, 50)),
	new THREE.MeshBasicMaterial({ color: LINE_COLOR, opacity: 0.3, transparent: true }),
);
circularGrid.position.z = -40
scene.add(circularGrid)


function animate(elapsed_msec) {
	requestAnimationFrame(animate);

	// current animation "time"
	const FULL_ROTATION = 2 * Math.PI;
	const anim_time = (elapsed_msec / 1000) * FULL_ROTATION / ANIMATION_LOOP_TIME;

	for (let i = 0; i < objects.length; i++) {
		// calc offset as percentage of a full rotation
		// this makes sure that all objects are equally spaced in "time" for the whole animation loop
		const anim_offset = (i / objects.length) * FULL_ROTATION;
		animateObject(objects[i], anim_time, anim_offset);
	}

	// rotate grid in sync with objects
	circularGrid.rotation.z = anim_time
	renderer.render(scene, camera);
}

function animateObject(obj, anim_time, anim_offset) {
	// animates an object to trace a certain path around a sphere
	// all objects traces the SAME path, they're just staggered by an offset value

	const radius = Math.sin(anim_time - anim_offset * ANIMATION_NUM_OBJECT_LAYERS) ** 2 * ANIMATION_RADIUS
	obj.position.set(
		Math.cos(anim_time - anim_offset) * radius,
		Math.sin(anim_time - anim_offset) * radius,
		Math.cos(anim_time - anim_offset * ANIMATION_NUM_OBJECT_LAYERS) * ANIMATION_RADIUS,
	);
	obj.lookAt(0, 0, 0);
	// add slight tilt so we see more than 1 face
	obj.rotation.x -= 0.2;
	obj.rotation.y += 0.5;
}


// Creates a normal mesh object but also adds a line mesh for its edges
function createObjectWithEdges(geometry, material) {
	const object = new THREE.Mesh(geometry, material);
	const edges = new THREE.LineSegments(
		new THREE.EdgesGeometry(geometry),
		new THREE.LineBasicMaterial({ color: LINE_COLOR })
	);
	object.add(edges); // add edges as child
	return object;
}


// start animation
animate();
