

// Get elements
const button = document.querySelector('#hero-button')

// Get auth status
firebase.auth().onAuthStateChanged(function (user) {

	// Redirect to appropriate page
	if(user){
		button.href = ''
		button.firstChild.textContent = 'Go to Dashboard'
		button.addEventListener('click', (e) => {
			e.preventDefault()
			window.location.href = 'public.html'
		})
	}	
});


// THREEJS ----------------------------



let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(
	75, window.innerWidth/window.innerHeight, 0.5, 1000 
)
camera.position.z = 5


// Light
// Ambient Light
const ambient = new THREE.AmbientLight(0xffffff, .9)
ambient.position.set(10, 10, 10)
scene.add(ambient)

// Directional Light
const light = new THREE.DirectionalLight(0xffffff, .1)
light.position.set(-10, 10, -10)
scene.add(light)

const light2 = new THREE.DirectionalLight(0xffffff, .1)
light2.position.set(10, 10, 10)
scene.add(light2)





let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.getElementById('threejs-background').appendChild(renderer.domElement)

// Geometry
let cubeGeometry = new THREE.BoxGeometry(.6, .6, .6,)
let donutGeometry = new THREE.TorusBufferGeometry( 1, .3, 20, 50 )

let material = new THREE.MeshLambertMaterial({color: 0xFFFFFF})

let cube = new THREE.Mesh(cubeGeometry, material)
cube.position.x += 1
cube.position.y += 2
scene.add(cube)

let donut = new THREE.Mesh(donutGeometry, material)
donut.position.x += -2.5
donut.position.y += -1.5
scene.add(donut)








renderer.render(scene, camera)

function animate(){

	requestAnimationFrame(animate)

	cube.rotation.x += 0.003
	cube.rotation.y += 0.007

	donut.rotation.x += 0.005
	donut.rotation.y += 0.002

	renderer.render(scene, camera)
}

animate()

// Window Resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	
	// Repostion model for mobile
	if(window.innerWidth <= 400){
		donut.position.x = -1
		console.log('reposition')
	}else{
		donut.position.x = -2.5
	}

    renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', onWindowResize)



// On dom load 
window.addEventListener('load',()=>{
	document.getElementById('threejs-background').style.opacity = '1'
})