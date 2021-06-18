
// Confirm the link is a sign-in with email link.
if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
	// Get the email if available. This should be available if the user completes
	// the flow on the same device where they started it.
	var email = window.localStorage.getItem('emailForSignIn');
	if (!email) {
		// User opened the link on a different device. To prevent session fixation
		// attacks, ask the user to provide the associated email again. For example:
		email = window.prompt('Please provide your email for confirmation');
	}
	// The client SDK will parse the code from the link
	firebase.auth().signInWithEmailLink(email, window.location.href)
		.then(function (result) {

			// Clear email from storage.
			window.localStorage.removeItem('emailForSignIn');

			// Reroute
			window.location.href = 'public.html'

		})
		.catch(function (error) {
			console.log(error)
		});
}






