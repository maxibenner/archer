///////////



// Get elements
const navLogout = document.querySelector('#nav--logout')

// Variables
//let artist


// Sign out -------------------------------------------
if (navLogout) {
    navLogout.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            // Sign-out successful.
            window.location.href = '/'
        }).catch(function (error) {
            // An error happened.
            console.log(error)
        });
    })
}



// Mobile menu logic
const hamburgerMenu = document.querySelector('.nav--menu')
const hamburger = document.querySelector('#styles--nav-menu-button')
const hamburgerBarA = document.querySelector('#hamburger--bar-a')
const hamburgerBarB = document.querySelector('#hamburger--bar-b')

if (hamburger) {
    hamburger.addEventListener('click', () => {

        if (!hamburger.classList.contains('active')) {
            hamburgerBarA.style.width = '40px'
            hamburgerBarB.style.width = '40px'
            hamburgerMenu.style.left = '0'
            hamburger.classList.add('active')
            document.body.style.overflow = 'hidden';
        } else {
            hamburgerBarA.style.width = '30px'
            hamburgerBarB.style.width = '20px'
            hamburgerMenu.style.left = '100%'
            hamburger.classList.remove('active')
            document.body.style.overflow = 'unset';
        }

    })
}






