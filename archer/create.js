
/*__________________________________ Elements ____________________________________*/

// Choice
const choice = document.getElementById('create--popup-choice')
const choiceUploadCard = document.getElementById('create--popup-choice-container-cards-upload')
const choiceCreateCard = document.getElementById('create--popup-choice-container-cards-create')

// Name
const nameForm = document.querySelector('#create--name-form');
const nameInput = document.querySelector('#create--name-form-input');
const nameButton = document.querySelector('#create--name-button');

// Label
const labelWrapper = document.getElementById('create--label-wrapper')
const labelCards = document.querySelectorAll('.create--label-card')
const labelButtonContinue = document.getElementById('create--label-continue-button')
// Label Fail
const labelFailWrapper = document.getElementById('create--label-fail-wrapper')
const labelFailRadioButton = document.getElementById('create--label-fail-radio-box')
const labelFailRadioCheckmark = document.getElementById('create--label-fail-radio-checkmark')
const labelFailDashboardButton = document.getElementById('create--label-fail-dashboard-button')

// Upload Model
const uploadModel = document.getElementById('create--upload-model-container')
const uploadModelCard = document.getElementById('create--upload-model-container-card')
const uploadModelCardInput = document.getElementById('create--upload-model-container-card-input')
const uploadModelCardBg = document.getElementById('create--upload-model-container-card-bg')
const uploadModelCardText = document.getElementById('create--upload-model-container-card-text')

// Upload Images
const imagesWrapper = document.getElementById('create--images-uploader-wrapper')
const imagesDropArea = document.getElementById('create--images-droparea')
const imageFilesContainer = document.getElementById('create--dnd-file-container')
const imagesInput = document.getElementById('create--images-input')
const imagesRequestQuoteButton = document.getElementById('create--images-quote-button')
const imagesLoader = document.getElementById('create--images--loader')

// Success
const successContainer = document.getElementById('create--quote-success')

// Cart
const cartCounter = document.querySelector('#global--cart-icon-count')
const cartItemContainer = document.querySelector('#global-cart-body-container-items')

// Variables
let userId
let diy
let projectName = sessionStorage.getItem("project")
let redirect = sessionStorage.getItem('redirect')


/*________________________________________ Init _________________________________________*/
setCartCounter(cartCounter)
populateCart(cartItemContainer)

// Check for redirect
if (redirect) {

    // Pull up corresponding element
    if (redirect === 'model') {
        uploadModel.style.display = 'block'
    } else {
        imagesWrapper.style.display = 'flex'
    }

    sessionStorage.removeItem('redirect')

} else {  

    // Show first module
    choice.style.display = 'flex'

}


/*__________________________________ Track Auth State ____________________________________*/
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        userId = user.uid
        if (nameInput.value) {
            nameButton.disabled = false
        }
    }
})

/*__________________________________ Listeners ___________________________________*/

/* Choice ______________________________*/

/* Upload Card */
choiceUploadCard.addEventListener('click', () => {
    choice.style.display = 'none'
    nameForm.style.display = 'block'
    diy = true
})

/* Create Card */
choiceCreateCard.addEventListener('click', () => {
    choice.style.display = 'none'
    labelWrapper.style.display = 'flex'
    diy = false
    scrollToTop()
})



/* Label _________________________________*/
/* Variables */
let lablesArray = []

// Label card clicks
labelCards.forEach(card => {

    card.addEventListener('click', (e) => {

        // Remove/add activity class + Set variables
        if (e.target.classList.contains('create--label-card_active')) {

            // Set visuals
            e.target.classList.remove('create--label-card_active')

            // Remove from array
            lablesArray = lablesArray.filter((value) => { return value != e.target.attributes.meta.value; });

        } else {

            // Set visuals
            e.target.classList.add('create--label-card_active')

            // Add to array
            lablesArray.push(e.target.attributes.meta.value)
        }

    })
})

// Label Continue Button Click
labelButtonContinue.addEventListener('click', () => {

    // Check for forbidden label
    if (lablesArray.includes('plant') || lablesArray.includes('food') || lablesArray.includes('clothing')) {

        // Close labels
        labelWrapper.style.display = 'none'

        // Show 'Uh Oh' message
        labelFailWrapper.style.display = 'flex'

        // Scroll to top
        scrollToTop()

    } else {

        // Hide label module
        labelWrapper.style.display = 'none'

        // Route to name module
        nameForm.style.display = 'block'
    }
})



/* Label Fail _________________________________*/
// Checkbox visuals
labelFailRadioButton.addEventListener('click', () => {

    // Remove/Add active class
    if (labelFailRadioCheckmark.classList.contains('create--label-fail-radio-checkmark_active')) {

        // Remove class
        labelFailRadioCheckmark.classList.remove('create--label-fail-radio-checkmark_active')
    } else {

        // Add class
        labelFailRadioCheckmark.classList.add('create--label-fail-radio-checkmark_active')
    }
})
// Back to dashboard
labelFailDashboardButton.addEventListener('click', () => {

    // Check if checkbox is active
    if (labelFailRadioCheckmark.classList.contains('create--label-fail-radio-checkmark_active')) {

        // Add user to "productTypeWaitlist"
        firebase.firestore().collection('waitlistProductType').doc(userId).set({
            product: lablesArray
        }).then(() => {

            // Reroute to dashboard
            window.location.href = './dashboard.html'
        })

    } else {

        // Reroute to dashboard
        window.location.href = './dashboard.html'
    }
})




/* Name _________________________________*/

// Activate button once project name is not empty
//DEMO: nameInput.addEventListener("keyup", () => {
//     if (nameInput.value) {
//         nameButton.disabled = false;
//     } else {
//         nameButton.disabled = true;
//     }
// });

// Prevent submiting form with return-key while button is deactivated
nameForm.onkeypress = function (e) {
    var key = e.charCode || e.keyCode || 0;
    if (key == 13 && nameButton.disabled == true) { e.preventDefault() }
}

// Submit project name
nameForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // DEMO:
    window.location.pathname = "/dashboard.html"

    // DEMO: if (userId) {

    //     sessionStorage.setItem("project", nameInput.value)
    //     createProject()
    //     nameForm.style.opacity = '0'

    //     if (diy === true) {
    //         uploadModel.style.display = 'block'
    //     } else {
    //         imagesWrapper.style.display = 'flex'
    //         /*setUploadView()*/
    //     }

    // }
})

// Create Firestore Project
function createProject() {

    // userId var is saved in app.js
    const docRef = firebase.firestore().collection("users").doc(userId).collection('projects').doc(sessionStorage.getItem("project"))

    docRef.set({
        status: 'Finalize Your Submission',
        price: null,
        owner: userId,
        projectName: sessionStorage.getItem("project"),
        submitDate: null,
        claimedBy: null,
        selfMade: diy,

    }).then(function () {
        console.log('Project successfully created!')
    })
}


/* Upload Model _____________________*/

// Card Clicks
uploadModelCard.addEventListener('click', () => {

    uploadModelCardInput.click()

})

// Input change
uploadModelCardInput.addEventListener('change', () => {

    // Get file extension
    const name = uploadModelCardInput.files[0].name
    const lastDot = name.lastIndexOf('.')
    const ext = name.substring(lastDot + 1)

    if (ext === 'glb') {

        // Remove completion styling in case of file change
        uploadModelCardInput.parentNode.style['box-shadow'] = '0 0px 0px rgba(111, 255, 130, 0)';

        // Get file
        var file = uploadModelCardInput.files[0];

        // Create StorageRef for specific file
        var storageRef = firebase.storage().ref('users/' + userId + '/' + 'projects/' + sessionStorage.getItem("project") + '/modelFiles/model.glb')

        // Upload file
        var task = storageRef.put(file);

        // Change text
        uploadModelCardText.innerHTML = 'Change';

        // Update progress bar
        task.on('state_changed',

            function progress(snapshot) {

                var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                uploadModelCardBg.style.width = percentage + '%';
            },

            function error(err) {
                console.log(err)
            },

            function complete() {

                finalizeDIYProject()

                // Add shadow with timeout to account for instant uploads
                setTimeout(() => { uploadModelCardInput.parentNode.style['box-shadow'] = '0 3px 10px rgba(0, 0, 0, 0.1)' }, 400)

                // Reroute
                setTimeout(() => { window.location.href = './dashboard.html' }, 2000)
            })
    } else {
        window.alert('Please upload a .glb 3D model file. If you do not have a 3D file of your product, choose "Create" instead of upload to have us build you one.')
        window.location.href = './dashboard.html'
    }



})

function finalizeDIYProject() {

    // userId var is saved in app.js
    const docRef = firebase.firestore().collection("users").doc(userId).collection('projects').doc(sessionStorage.getItem("project"))

    docRef.update({
        status: 'Completed',
        submitDate: Date.now(),
    })
}


/*_____________ Upload Images ________________*/

// Drag n Drop logic________________________________
;['dragover', 'dragenter'].forEach(event => {
    imagesDropArea.addEventListener(event, (e) => {
        e.preventDefault()
        e.stopPropagation()
        imagesDropArea.classList.add('create--images-dnd-container_highlight')
        document.body.style.cursor = "copy";
    })
})
    ;['dragleave', 'drop'].forEach(event => {
        imagesDropArea.addEventListener(event, (e) => {
            e.preventDefault()
            e.stopPropagation()
            imagesDropArea.classList.remove('create--images-dnd-container_highlight')
            document.body.style.cursor = "default";
        })
    })
imagesDropArea.addEventListener('drop', handleDrop, false)

function handleDrop(e) {

    let dt = e.dataTransfer
    let files = dt.files

    Array.from(files).forEach(file => {

        let fileElement = createFileItem(file.name)
        imageFilesContainer.append(fileElement)
        uploadFile(file, fileElement)

    })
}

// Prevent file drop outside of drop area
window.addEventListener("dragover", function (e) {
    e = e || event;
    e.preventDefault();
}, false);
window.addEventListener("drop", function (e) {
    e = e || event;
    e.preventDefault();
}, false);

// Browse Logic__________________________________
imagesDropArea.addEventListener('click', () => {
    imagesInput.click()
})
imagesInput.addEventListener('change', () => {
    handleBrowse(imagesInput.files)
})
function handleBrowse(files) {

    Array.from(files).forEach(file => {

        let fileElement = createFileItem(file.name)
        imageFilesContainer.append(fileElement)
        uploadFile(file, fileElement)

    })
}

// Request Quote
imagesRequestQuoteButton.addEventListener('click', async () => {

    // Show loader
    imagesLoader.classList.add('global--loader_absolute')
    imagesLoader.style.display = 'block'
    imagesRequestQuoteButton.style.color = 'var(--blue'

    // Add to firestore quote dir
    await firebase.firestore().collection('pending').doc('quotes').collection('projects').doc(userId + sessionStorage.getItem("project")).set({
        userId: userId,
        project: sessionStorage.getItem("project")
    })

    // Update user project doc status
    await firebase.firestore().collection("users").doc(userId).collection('projects').doc(sessionStorage.getItem("project")).update({
        status: 'Quote pending'
    })

    // Hide upload wrapper
    imagesWrapper.style.display = 'none'
    
    // Show success message
    successContainer.style.display = 'flex'
})



// Create file item
function createFileItem(fileName) {

    // Create file element
    let fileElement = document.createElement('div')
    fileElement.setAttribute('class', 'create--dnd-file')

    // Create name element
    let fileNameElement = document.createElement('div')
    fileNameElement.setAttribute('class', 'create--dnd-fileName')
    fileNameElement.textContent = fileName
    fileElement.append(fileNameElement)

    // Create progress container
    let progressContainer = document.createElement('div')
    progressContainer.setAttribute('class', 'create--dnd-progressbox')
    fileElement.append(progressContainer)

    // Create bar
    let progressBar = document.createElement('div')
    progressBar.setAttribute('class', 'create--dnd-progressbox-bar')
    progressContainer.append(progressBar)

    // Create bar progress
    let progressBarProgress = document.createElement('div')
    progressBarProgress.setAttribute('class', 'create--dnd-progressbox-bar-progress')
    progressBar.append(progressBarProgress)

    // Create progress text container
    let progressTextContainer = document.createElement('div')
    progressTextContainer.setAttribute('class', 'create--dnd-progressbox-text')
    progressContainer.append(progressTextContainer)

    // Create progress text time
    let progressTextTime = document.createElement('p')
    progressTextTime.textContent = 'calculating remaining time'
    progressTextTime.setAttribute('class', 'create--dnd-progressbox-text-time')
    progressTextContainer.append(progressTextTime)

    // Create progress text percentage
    let progressTextPercentage = document.createElement('p')
    progressTextPercentage.textContent = '0%'
    progressTextPercentage.setAttribute('class', 'create--dnd-progressbox-text-percentage')
    progressTextContainer.append(progressTextPercentage)

    // Create icon
    let fileIcon = document.createElement('img')
    fileIcon.setAttribute('class', 'create--dnd-icon')
    fileIcon.setAttribute('src', './icons/delete-grey.svg')
    fileElement.append(fileIcon)

    return fileElement

}
// Upload File
function uploadFile(file, fileElement) {

    // Get element name and make readable for selector (Detail 1 -> Detail1)
    var elementName = file.name.replace(/ /g, "-");

    // Get time start
    const timeStart = Date.now()

    // Create StorageRef for specific file
    var storageRef = firebase.storage().ref('users/' + userId + '/' + 'projects/' + sessionStorage.getItem("project") + '/' + elementName)

    // Upload file
    var task = storageRef.put(file);

    // Register cancel button
    fileElement.querySelector('.create--dnd-icon').addEventListener('click', cancelUpload)

    function cancelUpload() {
        // Cancel upload
        task.cancel()

        // Remove file element
        fileElement.remove()
    }


    // Update progress bar
    task.on('state_changed',

        function progress(snapshot) {

            //let secondsRemaining = 
            let percentage = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

            // Set progress bar
            fileElement.querySelector('.create--dnd-progressbox-bar-progress').style.width = percentage + '%';

            // Set text percentage
            fileElement.querySelector('.create--dnd-progressbox-text-percentage').textContent = percentage + '%';

            // Set text time remaining
            let remainingSeconds = secondsRemaining(fileElement, snapshot.totalBytes, snapshot.bytesTransferred, timeStart)
            if (remainingSeconds > 0 && remainingSeconds < 100000) {
                fileElement.querySelector('.create--dnd-progressbox-text-time').textContent = remainingSeconds + ' seconds remaining';
            }


        },

        function error(err) {
            console.log(err)
        },

        function complete() {

            // TODO: Add checkmark
            // Set colors
            fileElement.querySelector('.create--dnd-progressbox-text-percentage').style.color = 'var(--blue)'
            fileElement.querySelector('.create--dnd-fileName').style.color = 'var(--blue)'
            fileElement.querySelector('.create--dnd-progressbox-text').style.color = 'var(--blue)'
            // Set content
            fileElement.querySelector('.create--dnd-progressbox-text-time').textContent = '0 seconds remaining'
            fileElement.querySelector('.create--dnd-icon').setAttribute('src', './icons/checkmark-small-blue.svg')
            // Remove cancel event listener
            // Register cancel button
            fileElement.querySelector('.create--dnd-icon').removeEventListener('click', cancelUpload)

            // Activate button
            imagesRequestQuoteButton.disabled = false;

        })
}
// Calculate remaining seconds
function secondsRemaining(fileElement, totalBytes, transferredBytes, timeStart) {

    let percentageFinished = (transferredBytes / totalBytes) * 100
    let secondsElapsed = Math.floor((Date.now() - timeStart) / 1000)
    let secondPerPercentage = Math.floor(percentageFinished / secondsElapsed)
    let remainingPercentage = Math.floor(100 - percentageFinished)
    let remainingSeconds = Math.floor((remainingPercentage * secondPerPercentage) / 10)

    return remainingSeconds
}
// Scroll to top
function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

