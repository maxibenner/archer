// Fetch input field and button
const input = document.querySelector('#signup--input');
const form = document.querySelector('#signup--container');

// Get elements
const buttonTxt = document.querySelector('#payment-button-txt')
const buttonSpinner = document.querySelector('#payment-button-spinner')
const popup = document.querySelector('#confirmation-popup')
const body = document.querySelector('body')


/*________________ Variables _______________*/
let urlForVerification = 'https://' + window.location.hostname + '/verify'
if(window.location.hostname === 'localhost'){urlForVerification = 'https://localhost:5005/verify'}
console.log(urlForVerification)

// Listen for SUBMIT event
form.addEventListener('submit', (e)=>{
    
    e.preventDefault()

    // Show spinner
	buttonTxt.style.display = 'none'
    buttonSpinner.style.display = 'block'
    
    // Get email from input
    let email = input.value

    // Send auth link to email
    firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
    .then(function() {
        // The link was successfully sent. Inform the user.
        // Save the email locally so you don't need to ask the user for it again
        // if they open the link on the same device.
        console.log('sent')
        window.localStorage.setItem('emailForSignIn', email);

        // Hide spinner
        buttonTxt.style.display = 'block'
        buttonSpinner.style.display = 'none'

        // Open overlay
        signUpOverlay(body)
            
    })
    .catch(function(error) {
        // Some error occurred, you can inspect the code: error.code
        console.log(error);
    });

});


// Create action handler
var actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be whitelisted in the Firebase Console.
  url: urlForVerification,
  // This must be true.
  handleCodeInApp: true
};


/*____________________ Functions ______________________*/
function signUpOverlay(container) {

    let overlay = document.createElement('section')
    overlay.setAttribute('class', 'index--signup-overlay')
    container.innerHTML = ''
    container.append(overlay)

    let overlayInner = document.createElement('div')
    overlay.append(overlayInner)

    let title = document.createElement('h1')
    title.textContent = 'Welcome to Fotura'
    overlayInner.append(title)

    let p1 = document.createElement('p')
    p1.innerHTML = 'We sent a <strong>login-email</strong> to your inbox. This way, you don’t need to remember any passwords.'
    overlayInner.append(p1)

    let p2 = document.createElement('p')
    p2.textContent = 'You can now close this browser window.'
    overlayInner.append(p2)

    return
}




  
  
  