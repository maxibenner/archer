 


/*_____________________ Elements _________________________*/
const buttonDashboard = document.getElementById('index--button-dashboard')
const signUpForms = document.querySelectorAll('.sign-up-input')
const body = document.querySelector('body')
const navBarInvisible = document.querySelector('.nav--menu-invisible')

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






/*____________________ Sign Up ______________________*/

signUpForms.forEach((form) => {

    form.addEventListener('submit', (e) => {
        e.preventDefault()

        // Clear local storage if exists
        localStorage.removeItem('cartItems')

        let email = form.querySelector('input').value

        // Keep track of email trying to sign up
        if(email.includes('@') && email.includes('.')){
            let registeredEmails = firebase.firestore().collection('triedSignup').doc(email);
            let setWithMerge = registeredEmails.set({time: Date.now(),service: 'main'})
            console.log('email registered')
        }
        


        form.querySelector('button > svg').style.display = 'block'
        form.querySelector('button').style.color = '#00ECAB'

        // Send auth link to email
        firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
            .then(function () {
                // The link was successfully sent. Inform the user.
                // Save the email locally so you don't need to ask the user for it again
                // if they open the link on the same device.
                console.log('sent')
                window.localStorage.setItem('emailForSignIn', email);

                // Open popup
                signUpOverlay(body)

            })
            .catch(function (error) {
                // Some error occurred, you can inspect the code: error.code
                console.log(error);

                // Show error message
                if(error.message.includes('formatted')){
                    form.querySelector('.signUpError').textContent = 'Please use a valid email'
                } else{
                    form.querySelector('.signUpError').textContent = error.message
                }
                form.querySelector('.signUpError').style.opacity = 1;
                
                // Hide spinner
                form.querySelector('button > svg').style.display = 'none'
                form.querySelector('button').style.color = 'black'

                // Remove again
                setTimeout(()=>{ form.querySelector('.signUpError').style.opacity = 0}, 3000);

            });
    })
})


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
