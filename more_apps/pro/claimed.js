

/*_________________ Cloud Functions ____________________*/
let completeProject = firebase.functions().httpsCallable('completeProject');
/*_________________ Elements ____________________*/

const projectName = document.querySelector('#project-name')
const projectPay = document.querySelector('#project-pay')
const projectDeadline = document.querySelector('#project-deadline')
const projectCountdown = document.querySelector('#project-countdown')
const projectContainer = document.querySelector('#project-container')
const spinnerMain = document.querySelector('#claim-spinner')
const submitPopupCountdown = document.querySelector('#submit-popup-countdown')
const submitButton = document.querySelector('#button-submit')
const submitPopup = document.querySelector('#submit-popup-bundle')
const submitPopupCancel = document.querySelector('#submit-popup-cancel')
const submitInput = document.querySelector('#file-submit')
const submitPopupInner = document.querySelector('#submit-popup-container')
const popupOverlay = document.querySelector('#submit-popup-overlay')
const popupOverlayTxt = document.querySelector('#popup-overlay-txt')
const placeholder = document.querySelector('#claim-placeholder-container')
const submitPopupSubmit = document.querySelector('.submit-popup-confirm')
const submitPopupText = document.getElementById('submit-popup-confirm-text')
const submitPopupSpinner = document.getElementById('claim-spinner-popup')

// Inputs
const inputGlb = document.getElementById('file-glb')
const inputPreviewImage = document.getElementById('file-preview-image')


/*_________________ Variables ____________________*/

let claimedDoc = null
let projectId = null
let combined = null
let deactivated = false

let glbTracker = false
//let previewTracker = false
let submitTracker = false

// Total time for job -> at the moment 2 days = 172800000 Milliseconds
const timeFrame = 172800000


/*_________________ Init ____________________*/

firebase.auth().onAuthStateChanged(async (user) => {

    if (user) {

        // Get project id
        let artistProjectDoc = await firebase.firestore().collection('artists').doc(user.uid).collection('claimed').get()
        let docsArray = artistProjectDoc.docs.map(doc => doc.data())
        let projectIdArray = artistProjectDoc.docs.map(doc => doc.id)
        projectId = projectIdArray[0]
        claimedDoc = docsArray[0]
        combined = [claimedDoc, projectId]

        if (claimedDoc === undefined) {

            // No project claimed
            console.log('no project claimed')

            // Show placeholder
            placeholder.style.display = 'block';

            // Remove spinner
            spinnerMain.style.display = 'none'

        } else {

            // Get values
            let pay = 9000
            let name = claimedDoc.projectName
            let submissionTimestamp = claimedDoc.submissionTimestamp
            let ownerId = claimedDoc.ownerId

            addFileToList(ownerId, name)

            // Set UI
            projectName.innerHTML = name
            projectPay.innerHTML = '<sup>$</sup>' + pay / 100
            projectDeadline.innerHTML = moment(submissionTimestamp + timeFrame).format('MMMM Do - HH:mm')
            projectCountdown.innerHTML = timeLeft(submissionTimestamp)
            setTimeout(() => {
                spinnerMain.style.display = 'none'
                projectContainer.style.display = 'flex'
            }, 500);

            //claimedDoc = projectDataDoc.data()
        }
    }

});

addFileListener(inputGlb)
//addFileListener(inputPreviewImage)



/*_________________ Listeners ____________________*/

// Listen to first submit button click
submitButton.addEventListener('click', () => {

    // Open popup
    submitPopup.style.display = 'block'
})

// Final submit button click
submitPopupSubmit.addEventListener('click', () => {

    if (submitTracker === true) {

        // Spinner
        submitPopupText.textContent = ''
        submitPopupSpinner.style.display = 'flex'

        completeProject(combined).then((res) => {
            window.location.reload()
        })

    }else{
        console.log('Finish uploading all files')
    }

})

// Close popup
submitPopupCancel.addEventListener('click', () => {

    // Open popup
    submitPopup.style.display = 'none'
})

// Listen to file element change (file selected)
function addFileListener(inputElement) {

    inputElement.addEventListener('change', (e) => {

        // Get file
        var file = e.target.files[0];

        // Set filename
        e.target.parentNode.querySelector('p').innerHTML = file.name

        // Remove Upload icon
        e.target.parentNode.querySelector('img').style.display = 'none'

        // Create Storage Ref for specific file
        let storageRef = firebase.storage().ref().child('users').child(claimedDoc.ownerId).child('projects').child(claimedDoc.projectName).child('modelFiles/' + inputElement.getAttribute('meta'))

        // Upload file
        var task = storageRef.put(file);

        // Update progress bar
        task.on('state_changed',

            function progress(snapshot) {

                // Set size of download bar
                var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                e.target.parentNode.querySelector('.popup-container-progress').style.width = percentage + '%';
            },

            function error(err) {
                console.log(err)
            },

            function complete() {

                console.log('completed')

                if (inputElement.getAttribute('meta') === 'model.glb') {
                    glbTracker = true
                    console.log('glb')
                }
                /*if (inputElement.getAttribute('meta') === 'preview.png') {
                    previewTracker = true
                    console.log('preview')
                }*/

                // Activate Submit button
                if (glbTracker === true /*&& previewTracker === true*/) {
                    submitTracker = true
                    submitPopupSubmit.style.opacity = '1';
                    submitPopupSubmit.style.cursor = 'pointer';
                }

                // Change upload icon to checkmark icon and make visible
                e.target.parentNode.querySelector('img').src = './icons/checkmark.svg'
                e.target.parentNode.querySelector('img').style.display = 'unset'

            })
    })
}




/*_________________ Functions ____________________*/

function timeLeft(submitted) {

    let now = moment().unix()
    let past = Math.floor(submitted / 1000)
    let difference = (now - past) * 1000
    let timeLeft = timeFrame - difference

    let minutes = Math.floor(timeLeft / 60000);

    // Hours
    let hours = Math.floor(minutes / 60)

    let hoursInMinutes = hours * 60

    // + Minutes
    let minutesLeftover = minutes - hoursInMinutes

    return hours + 'h ' + minutesLeftover + 'min'
}

// Create file list element
function addFileToList(projectOwnerId, projectName) {

    // Get projects container element
    const projectFilesContainer = document.querySelector('#project-file-container')

    // Get list of files in storage dir
    let storageRef = firebase.storage().ref()
    let projectRef = storageRef.child('users').child(projectOwnerId).child('projects').child(projectName)

    // Find all the  items.
    projectRef.listAll().then(function (res) {

        res.items.forEach(function (itemRef) {

            // Create file elements
            const fileBox = document.createElement('div')
            const fileName = document.createElement('p')
            fileName.setAttribute('class', 'file-list-name')
            const fileBar = document.createElement('div')
            const fileDownload = document.createElement('p')

            // Append elements
            projectFilesContainer.appendChild(fileBox)
            fileBox.appendChild(fileName)
            fileBox.appendChild(fileBar)
            fileBox.appendChild(fileDownload)

            // Set attributes
            fileDownload.innerHTML = 'Download'
            fileName.innerHTML = itemRef.name

            // Download files
            fileDownload.addEventListener('click', () => {

                // Download file
                projectRef.child(itemRef.name).getDownloadURL().then((url) => {

                    console.log(url)
                    // This can be downloaded directly:
                    var xhr = new XMLHttpRequest()
                    xhr.responseType = 'blob'
                    xhr.onload = function (event) {
                        var blob = xhr.response;
                        saveBlob(blob, itemRef.name)
                    };
                    xhr.open('GET', url)
                    xhr.send()

                }).catch(function (error) {
                    // Handle any errors
                    console.log(error)
                })
            })
        })
    })
}

// Save to computer
function saveBlob(blob, fileName) {
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = fileName;
    a.dispatchEvent(new MouseEvent('click'));
}







