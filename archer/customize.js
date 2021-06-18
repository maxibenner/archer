console.log(window.location.pathname)
/*__________________________ Elements ___________________________*/
// General
const elementsContainer = document.querySelector('.content-container')
const addToCartButton = document.getElementById('add-to-cart')
const addToCart = document.getElementById('add-to-cart')
const title = document.getElementById('content-title')
const img = document.getElementById('preview-img')

// Cart
const cartCounter = document.querySelector('#global--cart-icon-count')
const cartItemContainer = document.querySelector('#global-cart-body-container-items')

// Modules
const moduleContainer = document.getElementById('modules-container')

/*__________________________ Variables ___________________________*/
// Scene name
const activeSceneName = sessionStorage.getItem('scene')
const activeProjectName = sessionStorage.getItem('project')


/*__________________________ References ___________________________*/
const sceneRef = firebase.firestore().collection('scenes').doc(activeSceneName)
console.log(sceneRef)

// Customization storage
let renderStorageObject = {
    'project': activeProjectName,
    'id': null,
    'sceneName': activeSceneName,
    'color': null,
    'angle': null,
    'variation': null
}




/*__________________________ Init ___________________________*/
clearSessionStorage()
setCartCounter(cartCounter)
populateCart(cartItemContainer)


// Set scene name
title.textContent = activeSceneName

// Load image
getImageUrl()

// Insert Modules
chooseModules(sceneRef)









/*__________________________ Listeners ___________________________*/
// Add render to cart
addToCart.addEventListener('click', addRenderToCart)

/*__________________________ Functions ___________________________*/

// Clear session data
function clearSessionStorage() {
    window.sessionStorage.removeItem('customize-name')
    window.sessionStorage.removeItem('customize-color')
    window.sessionStorage.removeItem('customize-angle')
}

// Check number of proejcts and renders in local storage
function numberOfCartItems(localStorageCart) {
    const cartItemString = window.localStorage.getItem(localStorageCart)
    const cartItemObject = JSON.parse(cartItemString)

    // Count projects and renders
    let numberOfProjects = cartItemObject.projects.length
    let numberOfRenders = cartItemObject.renders.length

    return (numberOfProjects + numberOfRenders)
}

function addRenderToLocalStorage() {

    if (localStorage.getItem('cartItems')) {

        let cartContentString = localStorage.getItem('cartItems')
        let cartContentObject = JSON.parse(cartContentString)

        if (!cartContentObject.projects.includes(projectName)) {

            cartContentObject.projects.push(projectName)
            let cartContentStringUpdated = JSON.stringify(cartContentObject)

            localStorage.setItem('cartItems', cartContentStringUpdated)
        }
    } else {

        let cartContentObject = { "projects": [], "renders": [renderStorageObject] }

        let cartContentString = JSON.stringify(cartContentObject)
        window.localStorage.setItem('cartItems', cartContentString)
    }
}



/*__________________________ Modules ___________________________*/

// Choose Modules
function chooseModules(sceneRef) {

    // Get Scene Data
    sceneRef.get().then((doc) => {

        // Get keys from object
        const moduleKeys = Object.keys(doc.data())

        // Insert appropriate elements into module container
        moduleKeys.forEach((key) => {

            switch (key) {

                case 'colors':
                    moduleContainer.append(createColorPicker(doc.data()[key]))

                    break

                case 'angles':
                    moduleContainer.append(createAnglePicker(doc.data()[key]))

                    break
            }
        })
    })
}

// Get preview image
function getImageUrl() {

    // Create a reference to the file we want to download
    let previewRef = firebase.storage().ref().child('scenes').child(activeSceneName).child('main.jpg')

    // Get the download URL
    previewRef.getDownloadURL().then((url) => {
        // Insert url into an <img> tag
        img.setAttribute('src', url)

    })
}

// Color Picker
function createColorPicker(colorArray) {

    // Create elements ->
    const element = document.createElement('div')
    const title = document.createElement('h3')
    const colorContainer = document.createElement('div')
    // Set attributes ->
    element.setAttribute('class', 'color-picker')
    title.innerText = 'Choose Color'
    // Append
    element.append(title)
    element.append(colorContainer)

    // Create color element for each color in array
    colorArray.forEach((color) => {

        let colorElement = document.createElement('div')
        colorElement.setAttribute('class', 'color-bubble')
        colorElement.style.background = color

        // Listen for selection
        colorElement.addEventListener('click', () => {
            // Clear activity indicator
            for (child of colorContainer.children) { child.classList.remove('color-picker_active') }
            // Add activity indicator
            colorElement.classList.add('color-picker_active')

            // Save selection
            renderStorageObject.color = color
            console.log('Selected color %c' + color, 'color:' + color)
            // TODO: Change image
        })

        colorContainer.append(colorElement)
    })

    // Set default color
    colorContainer.firstChild.classList.add('color-picker_active')
    renderStorageObject.color = colorArray[0]

    return element
}

// Angle Picker
function createAnglePicker(angleArray) {
    // Create elements ->
    const element = document.createElement('div')
    const title = document.createElement('h3')
    const angleContainer = document.createElement('div')
    // Set attributes
    element.setAttribute('class', 'angle-picker')
    title.innerText = 'Set Angle'
    // Append
    element.append(angleContainer)
    element.append(title)

    // Create Angle Element for each key in array
    angleArray.forEach((angle) => {
        const angleElement = document.createElement('div')
        const angleElementBox = document.createElement('div')
        const angleElementTitle = document.createElement('h3')
        angleElementBox.setAttribute('class', 'angle-checkbox')
        angleElementTitle.innerText = angle
        angleElement.append(angleElementBox)
        angleElement.append(angleElementTitle)

        angleContainer.append(angleElement)
        element.append(angleContainer)

        // Listen for selection
        angleElement.addEventListener('click', () => {
            // Clear activity indicator
            for (child of angleContainer.children) { child.querySelector('div').classList.remove('angle-picker_active') }
            // Add activity indicator
            angleElement.querySelector('div').classList.add('angle-picker_active')

            // Save selection
            renderStorageObject.angle = angle
            console.log('Selected angle %c' + angle, 'color:white; background:black;')
            // TODO: Change image
        })
    })

    // Set default color
    angleContainer.firstChild.firstChild.classList.add('angle-picker_active')
    renderStorageObject.angle = angleArray[0]

    return element
}

// Add to cart
function addRenderToCart() {

    // Attach uuid
    renderStorageObject.id = uuidv4()

    if (window.localStorage.getItem('cartItems') !== null) {

        // Add to existing data
        const cartItemString = window.localStorage.getItem('cartItems')
        const cartItemObject = JSON.parse(cartItemString)

        cartItemObject.renders.push(renderStorageObject)
        const cartItemStringUpdated = JSON.stringify(cartItemObject)

        window.localStorage.setItem('cartItems', cartItemStringUpdated)

        if (numberOfCartItems('cartItems') > 0) {
            cartCounterDisplay.innerHTML = numberOfCartItems('cartItems')
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

