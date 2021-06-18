// Fetch input field and button
const form = document.getElementById('resetpw--form')
const emailField = document.getElementById('resetpw--input-email')

// Get elements
const button = document.getElementById('resetpw--button')
const buttonTxt = document.getElementById('payment-button-txt')
const loader = document.getElementById('resetpw--loader')
const confirmation = document.getElementById('resetpw--confirmation-container')

/*________________ Variables _______________*/


// Listen for SUBMIT event
form.addEventListener('submit', (e)=>{
    
    e.preventDefault()

    // Show spinner
	  buttonTxt.style.display = 'none'
    loader.style.display = 'block'
    button.classList.add('resetpw--form-button_pending')

    // Get values from inputs
    let email = emailField.value 
    
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        // Email sent.
        form.style.opacity = 0
        setTimeout(()=>{ confirmation.style.opacity = 1; }, 300)
        setTimeout(()=>{ window.location.href = '/' }, 5000)
        

      }).catch(function(error) {

        // Hide spinner
        buttonTxt.style.display = 'block'
        loader.style.display = 'none'
        button.classList.remove('resetpw--form-button_pending')

        // An error happened.
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert(error.message)
        setTimeout(() => { window.alert(error.message) }, 500)
        

      });
    

})






