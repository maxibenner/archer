

// Total time for job -> at the moment 2 days = 172800000 Milliseconds
const timeFrame = 172800000

/*_________________ Elements ____________________*/

const body = document.querySelector('body')
const spinner = document.querySelector('#table-spinner')
const popupTime = document.querySelector('#claim-popup-time')
const popupPay = document.querySelector('#claim-popup-pay')
const popup = document.querySelector('#claim-popup-bundle')
const popupCancel = document.getElementById('claim-popup-cancel')
const popupConfirm = document.querySelector('#claim-popup-confirm')
const popupOverlay = document.querySelector('#claim-popup-overlay')
const popupSpinner = document.querySelector('#claim-spinner')
const popupOverlayText = document.querySelector('#claim-popup-overlay-text')
const popupOverlayCancel = document.querySelector('#claim-popup-overlay-delete')
const previewPopupContainer = document.querySelector('.preview-popup-container')
const previewPopupImg = document.querySelector('#preview-popup-image')
const previewPopupClose = document.getElementById('preview-popup-close')
const previewPopupBg = document.getElementById('preview-popup-bg')
const previewPopupSpinner = document.getElementById('preview-spinner')
const bannerApplication = document.querySelector('.banner-application')
const table = document.getElementById("public--projects-table")
const popupApplication = document.querySelector('.claim-popup-overlay-application')
const popupApplicationInput = document.getElementById('claim-popup-overlay-application-input')
const popupApplicationButton = document.getElementById('claim-popup-overlay-application-button')
const openAppLink = document.getElementById('application-banner-link')
const tablePlaceholder = document.querySelector('.public--projects-table-placeholder')


/*_________________ Variables ____________________*/

let activeProjectId = ''
let activeProjectOwner = ''
let activeProjectName = ''
let globalUser
let artist

/*_________________ Cloud Functions ____________________*/

let claimProject = firebase.functions().httpsCallable('claimProject')

/*_________________ References ____________________*/
let dataRef = firebase.firestore().collection('pending').doc('activeJobs').collection('projects')
let appRef = firebase.firestore().collection('pending').doc('applications').collection('artists')
const applicationRef = firebase.firestore().collection('pending').doc('applications').collection('artists')



/*____________________ Track Auth State ______________________*/
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(user.email)
        globalUser = user

        // Refresh token
        firebase.auth().currentUser.getIdToken(true).then(() => {

            firebase.auth().currentUser.getIdTokenResult()
                .then((idTokenResult) => {
                    
                    // Check custom claims
                    if (idTokenResult.claims.verifiedArtist) {
                        artist = true
                        console.log('artist')
                    } else {
                        artist = false
                        console.log('not an artist')

                        // Show app banner
                        applicationBanner()
                    }

                    // Initialize table
                    dataRef.get().then((collection) => {

                        if(collection.size < 1){
                            tablePlaceholder.style.display = 'block'
                        }

                        // Remove spinner
                        spinner.style.display = 'none'

                        // Build table
                        collection.forEach(doc => {

                            buildTableCell(doc.data().name, doc.data().timeOfSubmission, 9000, doc.data().user, doc.id)

                            if (!artist) {
                                // Deactivate table
                                let tableRows = document.querySelectorAll('.table-row')

                                tableRows.forEach((row) => {
                                    row.style.opacity = '0.1'
                                    row.style['pointer-events'] = 'none'
                                })
                            }
                        });

                    })
                })
        })

    } else {
        console.log('logged out')
    }
})

/*_________________ Init ____________________*/






/*_________________ Listeners ____________________*/

// Listen for claims
popupConfirm.addEventListener('click', (e) => {

    e.preventDefault()

    // Open popup overlay and spinner
    popupOverlay.style.display = 'block'
    popupSpinner.style.display = 'block'

    // Compound
    let projectData = { 'projectId': activeProjectId, 'projectOwner': activeProjectOwner, 'projectName': activeProjectName }

    // Cloud function
    claimProject(projectData).then((res) => {

        if (res.data === 'successfully claimed') {

            // Set elements
            popupSpinner.style.display = 'none'
            popupOverlay.style.background = '#00F0A8'
            popupOverlay.style.opacity = '1'
            popupOverlayText.innerHTML = 'Claim Successful!'
            popupOverlayCancel.style.display = 'block'

        } else {

            if (res.data === 'already claimed') {

                // Set elements
                popupSpinner.style.display = 'none'
                popupOverlay.style.background = '#FB565D'
                popupOverlay.style.opacity = '1'
                popupOverlayText.innerHTML = 'Project has already been claimed'
                popupOverlayCancel.style.display = 'block'

            }
            if (res.data === 'not verified') {

                // Set elements
                popupApplication.style.display = 'flex';
                popupSpinner.style.display = 'none'
                popupOverlayText.style.display = 'none'
                popupOverlay.style.background = 'white'
                popupOverlay.style.opacity = '1'
                popupOverlayCancel.style.display = 'block'
                popupOverlayCancel.setAttribute('src', './icons/delete.svg')

            }
            else {

                // Set elements
                popupSpinner.style.display = 'none'
                popupOverlay.style.background = '#FB565D'
                popupOverlay.style.opacity = '1'
                popupOverlayText.innerHTML = "You can't claim more than one project at once."
                popupOverlayCancel.style.display = 'block'
            }

        }
    })
})

// Img loaded
previewPopupImg.addEventListener('load', () => {
    console.log('loaded')
    previewPopupContainer.style.display = 'block'
    previewPopupClose.style.display = 'flex'
    previewPopupSpinner.style.display = 'none'
})

// Close Preview Popup
previewPopupClose.addEventListener('click', () => {
    previewPopupContainer.style.display = 'none'
    previewPopupImg.src = ''
    previewPopupBg.style.display = 'none'
})

// Listen to popup close
popupCancel.addEventListener('click', () => {
    popup.style.display = 'none'

})

// Listen for popup overlay close
popupOverlayCancel.addEventListener('click', () => { window.location.reload() })


/*_________________ Functions ____________________*/

function buildTableCell(projectName, timeSubmitted, pay, user, id) {

    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = table.insertRow(0)
    row.setAttribute('class', 'table-row')

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var cell1 = row.insertCell(0)
    var cell2 = row.insertCell(1)
    var cell3 = row.insertCell(2)

    // Add some text to the new cells:
    cell1.innerHTML = '<img id="cell-img-icon" class="cell-img-icon" src="./icons/img.svg">' + projectName
    cell1.setAttribute('meta', id)
    cell2.innerHTML = moment(timeSubmitted + timeFrame).format('MMMM Do - HH:mm')
    cell3.innerHTML = '$' + pay / 100

    // Add click (claim) listener
    row.addEventListener('click', () => {

        popup.style.display = 'block'
        popupTime.innerHTML = timeLeft(timeSubmitted)
        popupPay.innerHTML = '$' + pay / 100

        // Save project info to variables
        activeProjectId = id
        activeProjectOwner = user
        activeProjectName = projectName

    })

    // Add click (img preview) listener
    const previewImgIcon = document.getElementById('cell-img-icon')
    previewImgIcon.addEventListener('click', (e) => {
        e.stopPropagation()

        // Get reference to stored images
        const storageRef = firebase.storage().ref()
        const imgRef = storageRef.child("users").child(user).child('projects').child(projectName).child('Front').getDownloadURL().then((url) => {
            previewPopupImg.src = url
        })

        previewPopupBg.style.display = 'flex'
        previewPopupSpinner.style.display = 'flex'

    })

}

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

function applicationPopup() {

    let popup = document.createElement('div')
    popup.setAttribute('class', 'claim-popup-application')

    let popupInner = document.createElement('div')
    popupInner.setAttribute('class', 'claim-popup-application-inner')
    popup.append(popupInner)

    let title = document.createElement('h3')
    title.textContent = "Apply for Verification"
    popupInner.append(title)

    let p = document.createElement('p')
    p.textContent = 'To ensure consistent results, please send us a link to your portfolio.'
    popupInner.append(p);

    let input = document.createElement('input')
    input.setAttribute('id', 'claim-popup-overlay-application-input')
    input.setAttribute('type', 'url')
    input.setAttribute('placeholder', 'yourportfolio.com')
    popupInner.append(input)

    let button = document.createElement('button')
    button.setAttribute('id', 'claim-popup-application-button')
    button.textContent = 'Submit'
    popupInner.append(button)

    let spinner = document.createElement('div')
    spinner.setAttribute('class', 'application-spinner')
    spinner.innerHTML = "<svg width='100%' height='100%' viewBox='0 0 131 131' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' xmlns:serif='http://www.serif.com/' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;'><g id='clock'><circle id='ziffernblatt' cx='65.5' cy='65.5' r='60.5' style='fill:#fff;stroke:#000;stroke-width:10px;'/><path id='minute' d='M65.5,65.5l0,-43.5' style='fill:none;stroke:#000;stroke-width:10px;'/><path id='hour' d='M65.5,65.5l19.5,19.5' style='fill:none;stroke:#000;stroke-width:10px;'/></g></svg>"
    button.append(spinner)

    let close = document.createElement('img')
    close.setAttribute('src', './icons/delete.svg')
    popup.append(close)

    // Close
    close.addEventListener('click', (e) => {

        let parent = e.path[1].parentNode
        parent.removeChild(popup)
    })

    // Submit
    button.addEventListener('click', () => {

        if (input.value.length > 0) {

            button.style.color = 'black'
            spinner.style.display = 'block'

            applicationRef.doc(globalUser.uid).set({
                email: globalUser.email,
                portfolio: input.value
            }).then(() => {

                // Callback
                popupInner.innerHTML = '<strong>Thank you.</strong> We received your portfolio and will get back to you as soon as possible.'
                document.querySelector('.banner-application-text').textContent = 'We are reviewing your application and will get back to you as soon as possible.'
            })
        }
    })

    return popup
}

function insertAndAppear(container, element) {

    container.append(element)
    element.style.opacity = '1'
}

async function applicationBanner() {

    let banner = document.createElement('div')
    banner.setAttribute('class', 'banner-application')

    let text = document.createElement('p')
    text.setAttribute('class', 'banner-application-text')

    // Check for 'in Review' application
    let doc = await applicationRef.doc(globalUser.uid).get()

    // Set text based on status
    if (doc.exists) { text.textContent = 'We are reviewing your application and will get back to you as soon as possible.' }
    else {
        text.textContent = 'Before you can claim projects you need to get verified.'

        let link = document.createElement('span')
        link.setAttribute('id', 'application-banner-link')
        link.textContent = 'Apply for verification'
        text.append(link)
        link.addEventListener('click', () => { insertAndAppear(body, applicationPopup()) })
    }

    banner.append(text)

    // Get references for append
    let body = document.querySelector('body')
    let nav = document.querySelector('.nav')

    // Insert
    return body.insertBefore(banner, nav)

}

