

/* Viewer */
let viewer = document.querySelector('.ecom--viewer')

/* Cart */
const cartCounter = document.querySelector('#global--cart-icon-count')
const cartItemContainer = document.querySelector('#global-cart-body-container-items')

/* Product */
let axesHelperSwitch = document.getElementById('ecom--helper-axes')
let prodTurnXNeg = document.getElementById('ecom--prod-turn-x-neg')
let prodTurnXPos = document.getElementById('ecom--prod-turn-x-pos')
let prodTurnYNeg = document.getElementById('ecom--prod-turn-y-neg')
let prodTurnYPos = document.getElementById('ecom--prod-turn-y-pos')
let prodTurnZNeg = document.getElementById('ecom--prod-turn-z-neg')
let prodTurnZPos = document.getElementById('ecom--prod-turn-z-pos')

let prodHeight = document.getElementById('ecom--prod-height')

/* Camera */
let camMes = document.getElementById('ecom--cam-pedestal')
let camLat = document.getElementById('ecom--cam-truck')
let camZoom = document.getElementById('ecom--cam-dolly')
let camTilt = document.getElementById('ecom--cam-tilt')

// General
let body = document.querySelector('body')
let colorClickBox = document.getElementById('ecom--color-element')
let colorPicker = document.getElementById('ecom--color')
let floatSwitch = document.getElementById('ecom--float')
let transparencySwitch = document.getElementById('ecom--transparency')
let buttonSubmit = document.getElementById('ecom--button-submit')
let loader = document.getElementById('ecom--loader')
let axesHelper = new THREE.AxesHelper(5)
let transparencyEffector = document.querySelectorAll('.ecom--transparency-effector')

// Project
let activeProjectName = sessionStorage.getItem('project')
let activeSceneName = sessionStorage.getItem('scene')

// Control panel
let controlPanel = document.getElementById('ecom--control-panel')
let controlPanelBar = document.getElementById('ecom--controlpanel-bar')
let minimizeButton = document.getElementById('ecom--icon-minimize')
let dragItem = document.getElementById('ecom--controlpanel-bar-mover')
let panelInner = document.getElementById('ecom--controlpanel-container-inner')
let viewBlocker = document.getElementById('ecom--wrapper-blocker')



//------------------ Variables for 3D Viewer ------------------//
let camera
let renderer
let scene
let set
let model
let center
let bbox
let pivot
let modelHeight


//------------------ Variables for User Order ------------------//

// Misc
let coupons = []
let imgDataUrl

// Background
let backgroundColor = '0xFFFFFF'
let transparency = false
let bgPosX = 0
let bgPosY = 0
let bgPosZ = 0

// Product 0
let prod0QuatW = 1
let prod0QuatX = 0
let prod0QuatY = 0
let prod0QuatZ = 0

let prod0SizeX = 0
let prod0SizeY = 0
let prod0SizeZ = 0

let prod0posX = 0
let prod0posY = 0
let prod0posZ = 0

// Camera 
let cameraPosX = 0
let cameraPosY = 0
let cameraPosZ = 0

let cameraRotationX = 0
let cameraRotationY = 0
let cameraRotationZ = 0


// General
let uid = null
let userId
let sample = sessionStorage.getItem('sample')
let sampleCapacity = 10 // <- DEMO


//------------------ Variables for Draggable ------------------//
var active = false;
var actuallyDragged = false
var currentX;
var currentY;
var initialX;
var initialY;
var xOffset = 0;
var yOffset = 0; 

/*__________________________ Init Cart ___________________________*/
setCartCounter(cartCounter)
populateCart(cartItemContainer)

/* Get Model URL */
//DEMO
init3D()
//________
// firebase.auth().onAuthStateChanged(function (user) {
//     if (user) {

//         // Get user id
//         userId = user.uid

//         // Show loader
//         loader.style.display = 'block'

//         // Initialize viewer
//         init3D()

//         // Check for free sample renders
//         firebase.firestore().collection('data').doc(user.uid).get().then((doc) => {

//             if (doc.exists) {
//                 sampleCapacity = doc.data().freeSampleRenders
//             } else {
//                 //No sample renders left
//                 sampleCapacity = null
//             }
//         })
//     }
// })
/*____________________ Set Up UI ______________________*/
// Set control panel inner height
if (body.clientWidth > 900) {
    panelInner.style.height = controlPanel.clientHeight + 'px'
}

// Set "panel margin top" and "view blocker height" and "loader top" on mobile
if (body.clientWidth <= 900) {

    let distance = (((body.clientWidth - (body.clientWidth / 100) * 10) * 0.56) + 90)
    controlPanel.style['margin-top'] = distance + 'px'
    viewBlocker.style.height = distance + 'px'
    loader.style.top = (distance / 2) + 'px'
}

/*____________________ Listeners ______________________*/
// Listen for minimize
minimizeButton.addEventListener('click', () => {

    if (controlPanel.classList.contains('ecom--controlpanel-height')) {

        // Change size of control panel
        controlPanel.classList.remove('ecom--controlpanel-height')

        // Change arrow orientation
        minimizeButton.style.transform = 'translateY(-50%) rotate(180deg)'

    } else {
        // Change size of control panel
        controlPanel.classList.add('ecom--controlpanel-height')

        // Change arrow orientation
        minimizeButton.style.transform = 'translateY(-50%) rotate(0deg)'
    }

})

// Draggable
body.addEventListener("mousedown", dragStart, false);
body.addEventListener("mouseup", dragEnd, false);
body.addEventListener("mousemove", drag, false);

function dragStart(e) {

    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === controlPanelBar) {
        active = true;
    }
}
function drag(e) {
    if (active) {

        e.preventDefault();

        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        actuallyDragged = true

        setTranslate(currentX, currentY, controlPanel);
    }
}
function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;

    active = false;

    // Fix scroll issue for Safari
    if(actuallyDragged === true){
        
        panelInner.style['padding-top'] = '31px'
        setTimeout(()=>{panelInner.style['padding-top'] = '30px'},100)
    }

    actuallyDragged = false

    
    

}
function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
}

/*____________________ Viewer ______________________*/

// Loading managers
THREE.DefaultLoadingManager.onLoad = function () {

    // Loading Complete
    loader.style.display = 'none'
    renderer.render(scene, camera)

    // Activate submit button
    buttonSubmit.classList.remove('button-addToCart_inactive')
    
    // Activate controlpanel
    panelInner.style.opacity = '1'
    panelInner.style['pointer-events'] = 'all'

    // Activate transparent background
    document.querySelector('.ecom--viewer > canvas').style['background-image'] = "url('../images/ecom--transparent-bg.png')"
}

// Init
async function init3D() {

    // Set path variable
    let glbPath
    // Get correct model path
    if (sessionStorage.getItem('sample') === 'false') {
        glbPath = await firebase.storage().ref().child('users').child(userId).child('projects').child(sessionStorage.getItem('project')).child('modelFiles').child('model.glb').getDownloadURL()
    } else {
        //glbPath = await firebase.storage().ref().child('globalFiles').child('model.glb').getDownloadURL()
        glbPath = "./model.glb"
    }

    // Create Scene
    scene = new THREE.Scene();

    // Camera Init and Variables
    const fov = 23.9/*85mm*/
    const aspect = 1/1
    const near = 0.1
    const far = 500 
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    //console.log(camera.getFocalLength())

    // Hemisphere Light
    var ambientLight = new THREE.AmbientLight(0xffffff, .6/*.95*/)
    scene.add(ambientLight)

    // Spot Light
    var pointLight = new THREE.PointLight(0xffffff, .4)
    pointLight.castShadow = true
    pointLight.position.set(2, 2, 1)

    pointLight.shadow.camera.near = .1;
    pointLight.shadow.camera.far = 18;
    pointLight.shadow.bias = - 0.0007;
    pointLight.shadow.mapSize.set(1024, 1024);
    scene.add(pointLight)


    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true

    if (window.innerWidth > 900) {
        renderer.setSize((viewer.clientWidth - (viewer.clientWidth / 3)) * 0.56, (viewer.clientWidth - (viewer.clientWidth / 3)) * 0.56)
    } else {
        renderer.setSize((viewer.clientWidth - ((viewer.clientWidth / 100) * 10)) * 0.56, (viewer.clientWidth - ((viewer.clientWidth / 100) * 10)) * 0.56)
    }

    // Accurate Colors
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.gammaFactor = 2.2;

    // Env Image
    let cubeLoaderloader = new THREE.CubeTextureLoader()
    scene.environment = cubeLoaderloader.load([
        '../images/envMap/posx.jpg', '../images/envMap/negx.jpg',
        '../images/envMap/posy.jpg', '../images/envMap/negy.jpg',
        '../images/envMap/posz.jpg', '../images/envMap/negz.jpg'
    ])


    // Load Assets
    let loader = new THREE.GLTFLoader()

    // Set
    loader.load('./ecom-leaves.glb',
        function (gltf) {

            set = gltf.scene
            material = new THREE.MeshStandardMaterial({ color: 0xffffff });
            material.color.convertSRGBToLinear();

            // Update bounding box
            bbox = new THREE.Box3().setFromObject(set)
            size = bbox.getSize(new THREE.Vector3())

            // Accept shadows
            set.traverse(n => {
                if (n.isMesh) {
                    //n.material = material
                    //n.castShadow = true
                    n.receiveShadow = true
                }
            })
            scene.add(set)
        })

    // Model
    loader.load(glbPath,
        function (gltf) {

            model = gltf.scene

            // Create bounding box from model
            bbox = new THREE.Box3().setFromObject(model)

            // Get size vector from bounding box
            let size = bbox.getSize(new THREE.Vector3())

            // Get longest side of bounding box
            let maxSide = Math.max(size.x, size.y, size.z)

            // Rescale model
            model.scale.multiplyScalar(1 / maxSide)

            // Update bounding box
            bbox = new THREE.Box3().setFromObject(model)
            size = bbox.getSize(new THREE.Vector3())

            // Set height for global reference
            modelHeight = size

            // Get center vector from new bounding box
            center = bbox.getCenter(new THREE.Vector3())

            // Set geometry center to center of bounding box
            model.position.sub(center)

            // Accept shadows
            model.traverse(n => {
                if (n.isMesh) {
                    //n.material = new THREE.MeshStandardMaterial({color: 0x6f6f6f});
                    n.castShadow = true
                    n.receiveShadow = true

                }
            })
 
            // Center pivot point
            pivot = new THREE.Object3D()

            pivot.add(model)
            scene.add(pivot)
            pivot.position.set(0, size.y / 2, 0)
            prod0posY = pivot.position.y

            // CAMERA
            camera.position.copy(0)
            camera.position.set(0, size.y / 2, 4.5)
            camera.lookAt(0, size.y / 2, 0)

            // Set camera orientation for cart
            cameraRotationX = 90 + THREE.MathUtils.radToDeg(camera.rotation.x)
            cameraRotationY = camera.rotation.z //* -1
            cameraRotationZ = camera.rotation.y

            // Set camera position for cart
            cameraPosX = camera.position.x
            cameraPosY = camera.position.z * -1
            cameraPosZ = camera.position.y

        })


    // Add to DOM
    viewer.appendChild(renderer.domElement)
}


// Window Resize
window.addEventListener("resize", onWindowResize);
function onWindowResize() {

    camera.aspect = 1/1
    camera.updateProjectionMatrix()

    // Set viewer
    if (window.innerWidth > 900) {
        renderer.setSize((viewer.clientWidth - (viewer.clientWidth / 3)) * 0.56, (viewer.clientWidth - (viewer.clientWidth / 3)) * 0.56)
    } else {
        renderer.setSize((viewer.clientWidth - ((viewer.clientWidth / 100) * 10)) * 0.56, (viewer.clientWidth - ((viewer.clientWidth / 100) * 10)) * 0.56)
    }

    // Refresh render
    if (loader.style.display === 'none') {
        renderer.render(scene, camera)
    }

    // Set "panel margin top" and "view blocker height" and "loader top" on mobile
    if (body.clientWidth <= 900) {
        let distance = (((body.clientWidth - (body.clientWidth / 100) * 10) * 0.56) + 90)
        controlPanel.style['margin-top'] = distance + 'px'
        viewBlocker.style.height = distance + 'px'
        loader.style.top = (distance / 2) + 'px'
    } else {

        // Set control panel inner height
        panelInner.style.height = controlPanel.clientHeight + 'px'
    }



}

// Animate photo capture
function animateCapture(){

    // Capture image
    let dataURL = renderer.domElement.toDataURL('image/png');

    //Get viewer dimensions and location
    let viewerHeight = document.querySelector('.ecom--viewer > canvas').clientHeight
    let viewerWidth = document.querySelector('.ecom--viewer > canvas').clientWidth
    let viewerOffsetLeft = document.querySelector('.ecom--viewer > canvas').offsetLeft
    let viewerOffsetTop = document.querySelector('.ecom--viewer > canvas').offsetTop

    //Create new image element
    let img = document.createElement('img')
    img.setAttribute('src',dataURL)
    img.style.width = viewerWidth + 'px'
    img.style.height = viewerHeight + 'px'
    img.style.left = viewerOffsetLeft - (viewerWidth/2) + 'px'
    img.style.top = viewerOffsetTop - (viewerHeight/2) + 'px'
    img.setAttribute('class','global--studio-capture-element')
    body.append(img)
    setTimeout(()=>{img.remove()},1000)

}

// Save screenshot
function takeScreenshot(width, height) {

    // set camera and renderer to desired screenshot dimension
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    if (axesHelperSwitch.classList.contains('panel-toggle_active')) {
        pivot.remove(axesHelper)
    }
    renderer.render(scene, camera)

    let dataURL = renderer.domElement.toDataURL('image/png');

    // Save to cart object
    imgDataUrl = dataURL

    // Reset to old version
    if (axesHelperSwitch.classList.contains('panel-toggle_active')) {
        pivot.add(axesHelper)
    }

    // Reset canvas
    camera.aspect = 1/1
    camera.updateProjectionMatrix()

    if (window.innerWidth > 900) {
        renderer.setSize((viewer.clientWidth - (viewer.clientWidth / 3)) * 0.56, (viewer.clientWidth - (viewer.clientWidth / 3)) * 0.56)
    } else {
        renderer.setSize((viewer.clientWidth - ((viewer.clientWidth / 100) * 10)) * 0.56, (viewer.clientWidth - ((viewer.clientWidth / 100) * 10)) * 0.56)
    }
    // Refresh render
    renderer.render(scene, camera)
}



/*____________________ Modify Product Angle ______________________*/

// Helper variables for correct angle
let curRotX = 0
let curRotY = 0
let curRotZ = 0

// Turn around local X
prodTurnXNeg.onclick = function () {
    let newRot = curRotX - .3

    pivot.rotateX(newRot - curRotX)
    curRotX = newRot

    let worldQuaternion = new THREE.Quaternion()
    blenderRotation(pivot.getWorldQuaternion(worldQuaternion))

    // Refresh render
    renderer.render(scene, camera)
}
prodTurnXPos.onclick = function () {
    let newRot = curRotX + .3

    pivot.rotateX(newRot - curRotX)
    curRotX = newRot

    let worldQuaternion = new THREE.Quaternion()
    blenderRotation(pivot.getWorldQuaternion(worldQuaternion))

    // Refresh render
    renderer.render(scene, camera)
}

// Turn around local Y
prodTurnYNeg.onclick = function () {
    let newRot = curRotY - .3

    pivot.rotateY(newRot - curRotY)
    curRotY = newRot

    let worldQuaternion = new THREE.Quaternion()
    blenderRotation(pivot.getWorldQuaternion(worldQuaternion))

    // Refresh render
    renderer.render(scene, camera)
}
prodTurnYPos.onclick = function () {
    let newRot = curRotY + .3

    pivot.rotateY(newRot - curRotY)
    curRotY = newRot

    let worldQuaternion = new THREE.Quaternion()
    blenderRotation(pivot.getWorldQuaternion(worldQuaternion))

    // Refresh render
    renderer.render(scene, camera)
}

// Turn around local Z
prodTurnZNeg.onclick = function () {
    let newRot = curRotZ - .3

    pivot.rotateZ(newRot - curRotZ)
    curRotZ = newRot

    let worldQuaternion = new THREE.Quaternion()
    blenderRotation(pivot.getWorldQuaternion(worldQuaternion))

    // Refresh render
    renderer.render(scene, camera)
}
prodTurnZPos.onclick = function () {
    let newRot = curRotZ + .3

    pivot.rotateZ(newRot - curRotZ)
    curRotZ = newRot

    let worldQuaternion = new THREE.Quaternion()
    blenderRotation(pivot.getWorldQuaternion(worldQuaternion))

    // Refresh render
    renderer.render(scene, camera)
}

// Converts rotation to quaternion for Blender
function blenderRotation(quaternion) {
    prod0QuatW = quaternion.w
    prod0QuatX = quaternion.x
    prod0QuatY = quaternion.z * -1
    prod0QuatZ = quaternion.y
}


/*____________________ Modify Product ______________________*/

// Change product height
prodHeight.oninput = function () {

    pivot.position.y = (bbox.getSize(new THREE.Vector3()).y/2 + ((this.value)) / 200)
    prod0posY = pivot.position.y

    // Refresh render
    renderer.render(scene, camera)
}




//____________________ General Settings ______________________//

// Axex Helper
axesHelperSwitch.addEventListener('click', (e) => {

    if (e.target.classList.contains('panel-toggle')) {
        if (e.target.classList.contains('panel-toggle_active')) {
            e.target.classList.remove('panel-toggle_active')
            e.target.classList.add('panel-toggle_inactive')

            pivot.remove(axesHelper)
        } else {
            e.target.classList.remove('panel-toggle_inactive')
            e.target.classList.add('panel-toggle_active')

            pivot.add(axesHelper)
        }
    } else {
        if (e.target.parentNode.classList.contains('panel-toggle_active')) {
            e.target.parentNode.classList.remove('panel-toggle_active')
            e.target.parentNode.classList.add('panel-toggle_inactive')

            pivot.remove(axesHelper)
        } else {
            e.target.parentNode.classList.remove('panel-toggle_inactive')
            e.target.parentNode.classList.add('panel-toggle_active')

            pivot.add(axesHelper)
        }
    }

    // Refresh render
    renderer.render(scene, camera)
})

//____________________ Order ______________________//

// Listen for submission
buttonSubmit.addEventListener('click', (e) => {

    e.preventDefault()
    
    // Check if button is active
    if(buttonSubmit.classList.contains('button-addToCart_inactive')){

        window.alert("Please wait while the page is loading.")

        return
    }

    // Check if project name is defined
    if(activeSceneName === null || activeSceneName === undefined || activeSceneName === 'None'){

        window.alert('There was a problem. Please try again.')
        window.location.href = '../dashboard.html'

        return
    }

    // Check total samples remaining
    if (sample === 'true') {

        // Sample Capacity is 0 or NULL
        if (sampleCapacity == 0 || sampleCapacity == null) {

            buttonSubmit.classList.add('button-addToCart-limit')
            buttonSubmit.innerHTML = '<strong>Out of sample renders</strong>'
            setTimeout(() => {
                buttonSubmit.classList.remove('button-addToCart-limit')
                buttonSubmit.innerHTML = '<strong>Add to cart</strong>'
            }, 1000);

            return('No overall samples left')

        // Sample Capacity doc exists and is > 0
        } else {

            // Deduct sample renders already in cart
            if (window.localStorage.getItem('cartItems')) {

                const cartItemString = window.localStorage.getItem('cartItems')
                const cartItemObject = JSON.parse(cartItemString)

                let samplesInCart = cartItemObject.renders.filter(element => element.sample === 'true')

                if (samplesInCart.length + 1 > sampleCapacity) {

                    buttonSubmit.classList.add('button-addToCart-limit')
                    buttonSubmit.innerHTML = '<strong>Out of sample renders</strong>'
                    setTimeout(() => {
                        buttonSubmit.classList.remove('button-addToCart-limit')
                        buttonSubmit.innerHTML = '<strong>Add to cart</strong>'
                    }, 1000);

                    return 
                }

            // No renders in cart
            } else {
                //Do nothing
            }
        }
    }


    // Animate
    animateCapture()

    // Take Screenshot
    takeScreenshot(70, 70)

    // Build storage object
    renderStorageObject = {
        'background': {
            'color': backgroundColor,
            'transparent': transparency,
            'position': {
                'x': bgPosX,
                'y': bgPosZ,
                'z': bgPosY
            },
        },
        'camera': {
            'position': {
                'x': cameraPosX,
                'y': cameraPosY,
                'z': cameraPosZ
            },
            'rotation': {
                'x': cameraRotationX,
                'y': cameraRotationY,
                'z': cameraRotationZ
            }
        },
        'coupons': coupons,
        'products': [
            {
                'rotation': {
                    'w': prod0QuatW,
                    'x': prod0QuatX,
                    'y': prod0QuatY,
                    'z': prod0QuatZ
                },
                'size': {
                    'x': prod0SizeX,
                    'y': prod0SizeY,
                    'z': prod0SizeZ
                },
                'position': {
                    'x': prod0posX,
                    'y': prod0posY,
                    'z': prod0posZ
                }
            }
        ],
        'projectName': activeProjectName,
        'sample': sample,
        'sceneName': activeSceneName,
        'thumbImgDataUrl': imgDataUrl,
        'uid': uid,
        'userId': userId
    }

    //Only animate on larger screens
    if(window.innerWidth <= 700){
        addRenderToCart(renderStorageObject)
    }else{
        setTimeout(()=>{addRenderToCart(renderStorageObject)},900)
    }
    
    
})

// Add to cart
function addRenderToCart(storageObject) {

    // Attach uuid
    storageObject.uid = uuidv4()

    // TODO: Attach other variables

    if (window.localStorage.getItem('cartItems') !== null) {

        // Add to existing data
        const cartItemString = window.localStorage.getItem('cartItems')
        const cartItemObject = JSON.parse(cartItemString)

        cartItemObject.renders.push(renderStorageObject)
        const cartItemStringUpdated = JSON.stringify(cartItemObject)

        window.localStorage.setItem('cartItems', cartItemStringUpdated)

        let numberOfCartItems = cartItemObject.projects.length + cartItemObject.renders.length

        if (numberOfCartItems > 0) {
            cartCounterDisplay.innerHTML = numberOfCartItems
            cartIcon.style.visibility = 'visible'
        }

    } else {
        // First data point
        let cartContentObject = {
            "projects": [],
            "renders": [renderStorageObject]
        }
        let cartContentString = JSON.stringify(cartContentObject)

        window.localStorage.setItem('cartItems', cartContentString)

    }

    populateCart(cartItemContainer)
    setCartCounter(cartCounter)
}


