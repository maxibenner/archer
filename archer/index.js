


/*_____________________ Elements _________________________*/
const buttonDashboard = document.getElementById('index--button-dashboard')
const signUpForms = document.querySelectorAll('.sign-up-input')
const body = document.querySelector('body')
const navBarInvisible = document.querySelector('.nav--menu-invisible')
const rotateIndicator = document.getElementById('index--section-model-rotate-indicator')
let threejsViewer = document.getElementById('index--3d-model')
let imageScrollContainer = document.querySelector('.section-customize-image-wrapper')
let modifyImageContainer = document.getElementById('section-customize-modify-element')
let modifyImageColors = document.querySelector('.index--hiw-colors')

/*_____________________ Variables _________________________*/
let loggedIn
let urlForVerification = 'https://' + window.location.hostname + '/verify'


/*______________________ Listeners __________________________*/

// Dashboard / Sign In
buttonDashboard.addEventListener('click', () => {

    if (loggedIn === true) {
        window.location.href = './dashboard.html'
    } else {
        window.location.href = './sign-in.html'
    }

})


/*______________________Init__________________________*/



firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        navBarInvisible.style.visibility = 'visible'
        navBarInvisible.style.opacity = '1'
        navBarInvisible.style.transform = 'translateY(0)'
        loggedIn = true

    } else {
        buttonDashboard.querySelector('strong').textContent = 'Sign In'
        navBarInvisible.style.visibility = 'visible'
        navBarInvisible.style.opacity = '1'
        navBarInvisible.style.transform = 'translateY(0)'
        loggedIn = false
    }
})




/*____________________ Functions ______________________*/





/*____________________ THREEJS ______________________*/

/*let camera
let renderer
let scene
let model
let controls

init3D()

function init3D() {

    // Create Scene
    scene = new THREE.Scene();

    const fov = 35
    const aspect = threejsViewer.clientWidth / threejsViewer.clientHeight
    const near = 0.1
    const far = 500

    // Hemisphere Light
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1)
    scene.add(hemiLight)

    // Spot Light
    var spotLight = new THREE.SpotLight(0xffffff, 1)
    spotLight.castShadow = true
    spotLight.position.set(2, 2, 2)

    spotLight.angle = Math.PI * 0.1;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 4;
    spotLight.shadow.bias = - 0.002;
    spotLight.shadow.mapSize.set(1024, 1024);
    scene.add(spotLight)


    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(threejsViewer.clientWidth, threejsViewer.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true

    // Accurate Colors
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Env Image
    let cubeLoaderloader = new THREE.CubeTextureLoader()
    scene.environment = cubeLoaderloader.load([
        './images/envMap/posx.jpg', './images/envMap/negx.jpg',
        './images/envMap/posy.jpg', './images/envMap/negy.jpg',
        './images/envMap/posz.jpg', './images/envMap/negz.jpg'
    ])

    // Camera Setup
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.copy(0)
    camera.position.set(-2.5, -0.5, -1)
    camera.lookAt(scene.position)
    camera.updateProjectionMatrix()

    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false
    controls.enableKeys = false

    // Load Model
    let loader = new THREE.GLTFLoader()
    loader.load('./images/models/landing.glb',
        function (gltf) {

            model = gltf.scene

            var bbox = new THREE.Box3().setFromObject(model)
            var cent = bbox.getCenter(new THREE.Vector3())
            var size = bbox.getSize(new THREE.Vector3())

            // Rescale the object to normalized space
            var maxAxis = Math.max(size.x, size.y, size.z)
            model.scale.multiplyScalar(1.0 / maxAxis)
            bbox.setFromObject(model);
            bbox.getCenter(cent);
            bbox.getSize(size);

            // Reposition to 0,halfY,0
            model.position.copy(cent).multiplyScalar(-1)

            // Accept shadows
            model.traverse(n => {
                if (n.isMesh) {
                    n.castShadow = true
                    n.receiveShadow = true
                }
            })

            scene.add(model)

        })

        // Add to DOM
        threejsViewer.appendChild(renderer.domElement)

}

// On orbit control change
controls.addEventListener('change', ()=>{
    renderer.render(scene, camera)
})
// Loading managers
THREE.DefaultLoadingManager.onLoad = function () {

    // Loading Complete
    renderer.render(scene, camera)

}



function onWindowResize() {
    camera.aspect = threejsViewer.clientWidth / threejsViewer.clientHeight
    camera.updateProjectionMatrix()

    renderer.setSize(threejsViewer.clientWidth, threejsViewer.clientHeight)
    renderer.render(scene, camera)
}

// Window Resize
window.addEventListener("resize", onWindowResize);
*/

