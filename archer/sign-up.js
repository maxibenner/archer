// Fetch input field and button
const form = document.getElementById('signup--form')
const emailField = document.getElementById('signup--input-email')
const passwordField = document.getElementById('signup--input-password')

// Get elements
const button = document.getElementById('signup--button')
const buttonTxt = document.getElementById('payment-button-txt')
const loader = document.getElementById('sign-up--loader')

/*________________ Variables _______________*/


// Listen for SUBMIT event
form.addEventListener('submit', (e)=>{
    
    e.preventDefault()

    // Clear local storage if exists
    localStorage.removeItem('cartItems')

    // Show spinner
	buttonTxt.style.display = 'none'
    loader.style.display = 'block'
    button.classList.add('signup--form-button_pending')

    // Get values from inputs
    let email = emailField.value 
    let pw = passwordField.value 
    
    firebase.auth().createUserWithEmailAndPassword(email, pw).then(()=>{

        // Route to dashboard on success
        window.location.href = './dashboard.html'


    }).catch((error) => {

        // Hide spinner
        buttonTxt.style.display = 'block'
        loader.style.display = 'none'
        button.classList.remove('signup--form-button_pending')

        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        setTimeout(()=>{window.alert(error.message)},500)
    })
})






