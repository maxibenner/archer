/////////////////

/*__________________________ Elements ____________________________ */

// Quotes
const quotesContainer = document.getElementById('admin-quotes-container')

// Project Review
const projectReviewContainer = document.getElementById('projects-container')
const projectReviewTitle = document.querySelector('.dashboard-container-title-projects')

// Render
const renderContainer = document.getElementById('renders-container')
const renderTitle = document.querySelector('.dashboard-container-title-renders')

// Verification
const verificationTitle = document.querySelector('.dashboard-container-title-verifications')
const verificationContainer = document.getElementById('verifications-container')

// Control Panel
const projecCreationToggle = document.getElementById('toggle-project-creation')
const startInstanceButton = document.getElementById('start-instance')
const stopInstanceButton = document.getElementById('stop-instance')

// Sign in
const signupInput = document.querySelector('#signup--input');
const signupInputPassword = document.querySelector('#signup--input-password');
const signupForm = document.querySelector('#signup--container');
const signupButtonTxt = document.querySelector('#payment-button-txt')
const signupButtonSpinner = document.querySelector('#payment-button-spinner')
const signupPopup = document.querySelector('#confirmation-popup')



/*_________________ Cloud Functions ____________________*/
let verifyArtist = firebase.functions().httpsCallable('verifyArtist');
let notifyProjectCompleted = firebase.functions().httpsCallable('notifyProjectCompleted');

let startComputeInstance = firebase.functions().httpsCallable('startInstance')
let stopComputeInstance = firebase.functions().httpsCallable('stopInstance')


//__________________________ Variables ____________________________ //

// Project Review
let pendingProjects = []
let projectTracker

//__________________________ References ____________________________ //
// In Review Projects
let projectsRef = firebase.firestore().collection("pending").doc("inReview").collection('projects')
// Quote requests
let quotesRef = firebase.firestore().collection("pending").doc("quotes").collection('projects')
// ActiveJ obs
let renderRef = firebase.firestore().collection("pending").doc("activeJobs").collection('renders')
// Toggle Data
let projectCreationRef = firebase.firestore().collection('settings').doc('blockers')
// Verification Applications
let appRef = firebase.firestore().collection('pending').doc('applications').collection('artists')




//__________________________ Verify + Init ____________________________ //
firebase.auth().onAuthStateChanged(function (user) {
	if (user) {

		//Refresh token
		user.getIdToken(true).then(() => {

			// Check for token result
			user.getIdTokenResult()
				.then((idTokenResult) => {

					// Confirm the user is an Admin.
					if (idTokenResult.claims.admin) {

						// Initialize admin UI
						removeSpinner()
						createProjectReviewCards()
						createRenderCard()
						createVerificationCard()
						createQuotesCards()
						setToggle(projecCreationToggle, projectCreationRef, 'projectCreation')


						// Make admin UI visible
						document.querySelectorAll('.admin').forEach((e) => { e.classList.remove('admin') })

					} else {

						// Show regular user UI.
						removeSpinner()
						document.querySelector('.message-restricted').style.display = 'flex'

					}
				})
		})


	} else {

		// No user is signed in.
		// Show sign in dialog
		document.getElementById('signup--container').classList.remove('login')
		removeSpinner()
	}
});


//__________________________ Listeners ____________________________ //

// Logout
document.getElementById('nav--logout').addEventListener('click', () => {
	firebase.auth().signOut().then(function () {
		document.querySelector('body').style.display = 'none'
		window.location.reload()
	}).catch(function (error) {
		// An error happened.
	});
})

// Sign In Submit
signupForm.addEventListener('submit', (e) => {

	e.preventDefault()

	// Show spinner
	signupButtonTxt.style.color = 'black'
	signupButtonSpinner.style.display = 'block'

	// Get email from input
	let email = signupInput.value
	let password = signupInputPassword.value

	// Send auth link to email
	firebase.auth().signInWithEmailAndPassword(email, password).then((user) => {

		// Remove login form
		document.getElementById('signup--container').classList.add('login')

		// Run admin veriyfication
		//Refresh token
		user.getIdToken(true);

		// Check for token result
		user.getIdTokenResult()
			.then((idTokenResult) => {

				// Confirm the user is an Admin.
				if (idTokenResult.claims.admin) {
					// Initialize UI
					console.log('admin')

					removeSpinner()
					createProjectReviewCards()

					// Make admin UI visible
					document.querySelectorAll('.admin').forEach((e) => { e.classList.remove('admin') })
				} else {
					// Show regular user UI.
					removeSpinner()
					document.querySelector('.message-restricted').style.display = 'flex'
					console.log('not admin')
				}
			})

	}).catch(function (error) {
		console.log(error)
	});

});

// Toggle Project Creation
projecCreationToggle.addEventListener('click', () => {

	// Check project Creation blocker status
	projectCreationRef.get().then(async (doc) => {

		if (doc.data().projectCreation === true) {
			await projectCreationRef.update({ projectCreation: false })
			projecCreationToggle.classList.remove('panel-toggle_active')
			projecCreationToggle.classList.add('panel-toggle_inactive')
		} else {
			await projectCreationRef.update({ projectCreation: true })
			projecCreationToggle.classList.remove('panel-toggle_inactive')
			projecCreationToggle.classList.add('panel-toggle_active')
		}
	})

})

// Instance Start
/*startInstanceButton.addEventListener('click', () => {

	console.log('Attempting to start Instance')
	startComputeInstance().then((response) => {
		console.log(response)
	})
})
stopInstanceButton.addEventListener('click', () => {

	console.log('Attempting to stop Instance')
	stopComputeInstance().then((response) => {
		console.log(response)
	})

})*/



//__________________________ Functions ____________________________ //

// Cards
function quoteCard(userId, docId, name, urlArray) {

	// Create card
	const card = document.createElement('div')
	card.setAttribute('class', 'admin--quotes-element')

	// Title
	const title = document.createElement('h3')
	title.textContent = name
	card.append(title)

	// Images Container
	const imagesContainer = document.createElement('div')
	imagesContainer.setAttribute('class', 'admin--quotes-images-container')
	card.append(imagesContainer)

	// Images
	urlArray.forEach((url) => {

		const img = document.createElement('img')
		img.setAttribute('src', url)
		img.setAttribute('class', 'admin--quotes-images-container-img')
		imagesContainer.append(img)
	});

	// Interaction Container
	const interactionContainer = document.createElement('div')
	interactionContainer.setAttribute('class', 'admin--quotes-input-container')
	card.append(interactionContainer)

	// Input
	const input = document.createElement('input')
	input.setAttribute('type', 'text')
	input.setAttribute('placeholder', '$')
	interactionContainer.append(input)

	// Button Decline
	const buttonDecline = document.createElement('button')
	buttonDecline.setAttribute('class', 'admin--quotes-decline')
	buttonDecline.textContent = 'Decline Project'
	interactionContainer.append(buttonDecline)

	// Button Submit
	const buttonSubmit = document.createElement('button')
	buttonSubmit.setAttribute('class', 'admin--quotes-submit')
	buttonSubmit.textContent = 'Submit Quote'
	interactionContainer.append(buttonSubmit)

	// Listeners __________________
	buttonSubmit.addEventListener('click',()=>{

		// Get price from input field
		let price

		// Set price
		if(input.value == ''){
			price = '0'
		}else{
			price = input.value
		}

		// Submit quote
		firebase.firestore().collection('users').doc(userId).collection('projects').doc(name).update({
			status: 'Check quote',
			price: price
		})

		// Delete from quote dir
		firebase.firestore().collection('pending').doc('quotes').collection('projects').doc(docId).delete()

		// Remove card
		card.parentNode.removeChild(card)
		
	})
	buttonDecline.addEventListener('click', async ()=>{

		// Delete project from user
		firebase.firestore().collection('users').doc(userId).collection('projects').doc(name).delete()
		
		// Delete quote from quote dir
		firebase.firestore().collection('pending').doc('quotes').collection('projects').doc(docId).delete()

		// List all images
		firebase.storage().ref().child('users').child(userId).child('projects').child(name).listAll().then((res)=>{

			// Delete each item
			res.items.forEach((item) => { item.delete() })
		})

		// Remove card
		card.parentNode.removeChild(card)
	})

	return card

}

function projectReviewCard(data, docId) {

	projectTracker++
	// Create elements and add attributes

	// Card
	const card = document.createElement('div')
	card.setAttribute('class', 'admin-container')

	// Card inner
	const body = document.createElement('div')
	body.setAttribute('class', 'review-project-body')
	card.append(body)

	// Image
	const img = document.createElement('div')
	img.setAttribute('class', 'review-project-image')
	body.append(img)

	// Data and Button Container
	const dataContainer = document.createElement('div')
	dataContainer.setAttribute('class', 'review-project-data')
	body.append(dataContainer)

	//_____________________ Name ________________________//

	// Line
	const dataLineName = document.createElement('div')
	dataLineName.setAttribute('class', 'review-project-data-line')
	dataContainer.append(dataLineName)

	// Element
	const dataLineNameText = document.createElement('div')
	dataLineNameText.textContent = data.projectName
	dataLineName.append(dataLineNameText)

	//_____________________ Submitted ________________________//

	// Line
	const dataLineSubmitted = document.createElement('div')
	dataLineSubmitted.setAttribute('class', 'review-project-data-line')
	dataContainer.append(dataLineSubmitted)

	// Title
	const dataLineSubmittedTitle = document.createElement('div')
	dataLineSubmittedTitle.textContent = 'Submitted'
	dataLineSubmitted.append(dataLineSubmittedTitle)

	// Value
	const dataLineSubmittedValue = document.createElement('div')
	dataLineSubmittedValue.textContent = moment(data.submissionTimestamp).local().format('MMMM Do - HH:mm')
	dataLineSubmitted.append(dataLineSubmittedValue)

	//_____________________ Model ________________________//

	// Line
	const dataLineModel = document.createElement('div')
	dataLineModel.setAttribute('class', 'review-project-data-line')
	dataContainer.append(dataLineModel)

	// Title
	const dataLineModelTitle = document.createElement('div')
	dataLineModelTitle.textContent = 'Model'
	dataLineModel.append(dataLineModelTitle)

	// Value
	const dataLineModelValue = document.createElement('div')
	dataLineModelValue.textContent = 'download'
	dataLineModelValue.setAttribute('class', 'global--download')
	dataLineModel.append(dataLineModelValue)

	// Get project storage ref
	let projectRef = firebase.storage().ref().child('users').child(data.ownerId).child('projects').child(data.projectName).child('modelFiles')

	// Download files
	dataLineModelValue.addEventListener('click', () => {

		// Download file
		projectRef.child('model.glb').getDownloadURL().then((url) => {

			modelDownloadUrl = url

			// This can be downloaded directly:
			var xhr = new XMLHttpRequest()
			xhr.responseType = 'blob'
			xhr.onload = function (event) {
				var blob = xhr.response;
				saveBlob(blob, data.projectName + '.glb')
			};
			xhr.open('GET', url)
			xhr.send()

		}).catch(function (error) {
			// Handle any errors
			console.log(error)
		})
	})


	// _____________________ ThreeJS ________________________ //
	let camera
	let renderer
	let scene
	let model
	let center
	let bbox
	let pivot
	let modelUrl

	init3D()
	async function init3D() {

		// Get file url
		await projectRef.child('model.glb').getDownloadURL().then((url) => {
			modelUrl = url
		}).catch(function (error) { console.log(error) })

		// Create Scene
		scene = new THREE.Scene();

		const fov = 35
		const aspect = img.clientWidth / img.clientHeight
		const near = 0.1
		const far = 500

		// Hemisphere Light
		var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.2)
		scene.add(hemiLight)

		// Spot Light
		var spotLight = new THREE.SpotLight(0xffffff, .07)
		spotLight.castShadow = true
		spotLight.position.set(-2, 2, 2)

		spotLight.angle = Math.PI * 0.1;

		spotLight.shadow.camera.near = 1;
		spotLight.shadow.camera.far = 4;
		spotLight.shadow.bias = - 0.002;
		spotLight.shadow.mapSize.set(1024, 1024);
		scene.add(spotLight)

		// Spot Light 2
		var spotLight2 = new THREE.SpotLight(0xffffff, .07)
		spotLight2.castShadow = true
		spotLight2.position.set(-2, 2, -2)

		spotLight2.angle = Math.PI * 0.1;

		spotLight2.shadow.camera.near = 1;
		spotLight2.shadow.camera.far = 4;
		spotLight2.shadow.bias = - 0.002;
		spotLight2.shadow.mapSize.set(1024, 1024);
		scene.add(spotLight2)


		// Renderer
		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		renderer.setSize(img.clientWidth, img.clientHeight)
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.shadowMap.enabled = true

		// Accurate Colors
		renderer.outputEncoding = THREE.sRGBEncoding;

		// Env Image
		let cubeLoader = new THREE.CubeTextureLoader()
		scene.environment = cubeLoader.load([
			'./images/envMap/posx.jpg', './images/envMap/negx.jpg',
			'./images/envMap/posy.jpg', './images/envMap/negy.jpg',
			'./images/envMap/posz.jpg', './images/envMap/negz.jpg'
		])


		// Load Model
		let loader = new THREE.GLTFLoader()

		// Model
		loader.load(modelUrl,
			function (gltf) {

				model = gltf.scene

				// Create bounding box from model
				bbox = new THREE.Box3().setFromObject(model)

				// Get size vector from bounding box
				let size = bbox.getSize(new THREE.Vector3())

				// Get longest side of bounding box
				let maxSide = Math.max(size.x, size.y, size.z)

				// Rescale model
				model.scale.multiplyScalar(1 / maxSide)

				// Update bounding box
				bbox = new THREE.Box3().setFromObject(model)
				size = bbox.getSize(new THREE.Vector3())

				// Get center vector from new bounding box
				center = bbox.getCenter(new THREE.Vector3())

				// Set geometry center to center of bounding box
				model.position.sub(center)

				// Accept shadows
				model.traverse(n => {
					if (n.isMesh) {
						//n.material = new THREE.MeshStandardMaterial({color: 0x6f6f6f});
						n.castShadow = true
						n.receiveShadow = true
					}
				})

				scene.add(model)

				// Center pivot point
				pivot = new THREE.Object3D()

				pivot.add(model)
				scene.add(pivot)
				pivot.position.set(0, size.y / 2, 0)

				// Camera Setup
				camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
				camera.position.copy(0)
				camera.position.set(0, 1, 3)
				camera.lookAt(0, size.y / 2, 0)
				camera.updateProjectionMatrix()
				//camera.lookAt()


				animate()

			})


		// Add to DOM
		img.appendChild(renderer.domElement)



	}



	function animate() {
		requestAnimationFrame(animate)
		pivot.rotation.y -= 0.005
		renderer.render(scene, camera)
	}

	function onWindowResize() {
		camera.aspect = img.clientWidth / img.clientHeight
		camera.updateProjectionMatrix()

		renderer.setSize(img.clientWidth, img.clientHeight)
	}

	// Window Resize
	window.addEventListener('resize', onWindowResize)


	// Save screenshot
	function takeScreenshot(width, height) {

		// set camera and renderer to desired screenshot dimension
		camera.aspect = width / height
		camera.updateProjectionMatrix()
		renderer.setSize(width, height)

		pivot.rotation.y = .4

		renderer.render(scene, camera)

		let dataURL = renderer.domElement.toDataURL('image/png')

		// Reset to old version
		onWindowResize()

		return dataURL
	}


	//_____________________ Customer ________________________//

	// Line
	const dataLineCustomer = document.createElement('div')
	dataLineCustomer.setAttribute('class', 'review-project-data-line')
	dataContainer.append(dataLineCustomer)

	// Title
	const dataLineCustomerTitle = document.createElement('div')
	dataLineCustomerTitle.textContent = 'Owner Id'
	dataLineCustomer.append(dataLineCustomerTitle)

	// Value
	const dataLineCustomerValue = document.createElement('div')
	dataLineCustomerValue.textContent = data.ownerId
	dataLineCustomer.append(dataLineCustomerValue)

	//_____________________ Artist ________________________//

	// Line
	const dataLineArtist = document.createElement('div')
	dataLineArtist.setAttribute('class', 'review-project-data-line')
	dataContainer.append(dataLineArtist)

	// Title
	const dataLineArtistTitle = document.createElement('div')
	dataLineArtistTitle.textContent = 'Artist Id'
	dataLineArtist.append(dataLineArtistTitle)

	// Value
	const dataLineArtistValue = document.createElement('div')
	dataLineArtistValue.textContent = data.artistId
	dataLineArtist.append(dataLineArtistValue)

	//_____________________ Buttons ________________________//

	// Line
	const lineButtons = document.createElement('div')
	lineButtons.setAttribute('class', 'review-project-button-container')
	dataContainer.append(lineButtons)

	// Contact Artist
	const buttonContact = document.createElement('a')
	buttonContact.textContent = 'Contact Artist'
	buttonContact.setAttribute('href', 'mailto:' + data.email)
	lineButtons.append(buttonContact)

	// Approve
	const buttonApprove = document.createElement('a')
	buttonApprove.textContent = 'Approve'
	lineButtons.append(buttonApprove)

	// Add listener for approved
	buttonApprove.addEventListener('click', () => {

		console.log('click')
		// Create thumbnail
		let thumbnail = takeScreenshot(300, 300)

		finalizeProject(data, docId, card, thumbnail)


	})


	return card
}

function renderCard(data, docId) {

	let card = document.createElement('div')
	card.setAttribute('class', 'admin-container-renders')

	let loader = document.createElement('div')
	loader.setAttribute('class', 'admin-container-renders-loader')
	card.append(loader)

	let projectName = document.createElement('div')
	projectName.setAttribute('class', 'render-container-title')
	projectName.textContent = data.projectName
	card.append(projectName)

	let cardInner = document.createElement('div')
	cardInner.setAttribute('class', 'render-container-inner')
	card.append(cardInner)

	let date = document.createElement('div')
	date.setAttribute('class', 'render-container-data')
	cardInner.append(date)
	let dateTitle = document.createElement('div')
	dateTitle.setAttribute('class', 'render-container-key')
	dateTitle.textContent = 'Date'
	date.append(dateTitle)
	let dateValue = document.createElement('div')
	dateValue.setAttribute('class', 'render-container-value')
	dateValue.textContent = moment(data.timeOfSubmission).local().format('MMMM Do - HH:mm')
	date.append(dateValue)

	let scene = document.createElement('div')
	scene.setAttribute('class', 'render-container-data')
	cardInner.append(scene)
	let sceneTitle = document.createElement('div')
	sceneTitle.setAttribute('class', 'render-container-key')
	sceneTitle.textContent = 'Scene'
	scene.append(sceneTitle)
	let sceneValue = document.createElement('div')
	sceneValue.setAttribute('class', 'render-container-value')
	sceneValue.textContent = data.name
	scene.append(sceneValue)

	let angle = document.createElement('div')
	angle.setAttribute('class', 'render-container-data')
	cardInner.append(angle)
	let angleTitle = document.createElement('div')
	angleTitle.setAttribute('class', 'render-container-key')
	angleTitle.textContent = 'Angle'
	angle.append(angleTitle)
	let angleValue = document.createElement('div')
	angleValue.setAttribute('class', 'render-container-value')
	angleValue.textContent = data.angle
	angle.append(angleValue)

	let color = document.createElement('div')
	color.setAttribute('class', 'render-container-data')
	cardInner.append(color)
	let colorTitle = document.createElement('div')
	colorTitle.setAttribute('class', 'render-container-key')
	colorTitle.textContent = 'Color'
	color.append(colorTitle)
	let colorValue = document.createElement('div')
	colorValue.setAttribute('class', 'render-container-value')
	colorValue.textContent = data.color
	colorValue.style.color = data.color
	color.append(colorValue)

	let variation = document.createElement('div')
	variation.setAttribute('class', 'render-container-data')
	cardInner.append(variation)
	let variationTitle = document.createElement('div')
	variationTitle.setAttribute('class', 'render-container-key')
	variationTitle.textContent = 'Variation'
	variation.append(variationTitle)
	let variationValue = document.createElement('div')
	variationValue.setAttribute('class', 'render-container-value')
	if (data.variation === null) {
		variationValue.textContent = 'N/A'
	} else {
		variationValue.textContent = data.variation
	}
	variation.append(variationValue)

	let model = document.createElement('div')
	model.setAttribute('class', 'render-container-data')
	cardInner.append(model)
	let modelTitle = document.createElement('div')
	modelTitle.setAttribute('class', 'render-container-key')
	modelTitle.textContent = 'Model'
	model.append(modelTitle)
	let modelValue = document.createElement('div')
	modelValue.setAttribute('class', 'render-container-value render-container-download')
	modelValue.textContent = 'download'
	model.append(modelValue)

	// Get project storage ref
	let projectRef = firebase.storage().ref().child('users').child(data.user).child('projects').child(data.projectName).child('modelFiles')

	// Download files
	modelValue.addEventListener('click', () => {

		// Download file
		projectRef.child('model.glb').getDownloadURL().then((url) => {

			console.log(url)
			// This can be downloaded directly:
			var xhr = new XMLHttpRequest()
			xhr.responseType = 'blob'
			xhr.onload = function (event) {
				var blob = xhr.response;
				saveBlob(blob, data.projectName + '.glb')
			};
			xhr.open('GET', url)
			xhr.send()

		}).catch(function (error) {
			// Handle any errors
			console.log(error)
		})
	})


	// Input
	let input = document.createElement('input')
	input.setAttribute('type', 'file')
	cardInner.append(input)

	input.addEventListener('change', (e) => {

		// Get file
		var file = e.target.files[0];

		// Create Storage Ref for specific file
		let storageRef = firebase.storage().ref().child('users').child(data.user).child('projects').child(data.projectName).child('images/' + docId + '.png')

		// Upload file
		var task = storageRef.put(file);

		// Update progress bar
		task.on('state_changed',

			function progress(snapshot) {

				// Set size of download bar
				var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				loader.style.width = percentage + '%';
			},

			function error(err) {
				console.log(err)
			},

			function complete() {

				console.log('completed')

				console.log(docId)

				// Set render in user folder to completed
				firebase.firestore().collection('pending').doc('activeJobs').collection('renders').doc(docId).delete().catch((e) => { console.log(e) })

				// Delete render from pending collection
				firebase.firestore().collection('users').doc(data.user).collection('renders').doc(docId).update({ status: 'complete' }).catch((e) => { console.log(e) })

				// Change upload icon to checkmark icon and make visible
				card.style.opacity = 0
				setTimeout(() => { card.style.display = 'none' }, 300)


			})
	})

	return card
}

function verificationCard(data, docId) {

	let card = document.createElement('div')
	card.setAttribute('class', 'admin-container-verification')

	// Email
	let email = document.createElement('div')
	email.setAttribute('class', 'verification-container-data')
	card.append(email)

	let emailTitle = document.createElement('div')
	emailTitle.setAttribute('class', 'verification-container-key')
	emailTitle.textContent = 'Email'
	email.append(emailTitle)

	let emailValue = document.createElement('div')
	emailValue.setAttribute('class', 'verification-container-value')
	emailValue.textContent = data.email
	email.append(emailValue)

	// Portfolio
	let portfolio = document.createElement('div')
	portfolio.setAttribute('class', 'verification-container-data')
	card.append(portfolio)

	let portfolioTitle = document.createElement('div')
	portfolioTitle.setAttribute('class', 'verification-container-key')
	portfolioTitle.textContent = 'Portfolio'
	portfolio.append(portfolioTitle)

	let portfolioValue = document.createElement('div')
	portfolioValue.setAttribute('class', 'verification-container-value')
	portfolioValue.textContent = data.portfolio
	portfolio.append(portfolioValue)

	// Buttons
	let buttons = document.createElement('div')
	buttons.setAttribute('class', 'verification-container-actions')
	card.append(buttons)

	let approve = document.createElement('button')
	approve.setAttribute('class', 'verification-container-actions-approve')
	approve.textContent = 'Approve'
	buttons.append(approve)

	let reject = document.createElement('button')
	reject.setAttribute('class', 'verification-container-actions-reject')
	reject.textContent = 'Reject'
	buttons.append(reject)

	approve.addEventListener('click', () => {

		verifyArtist(docId).then(() => {
			console.log(docId)
			card.style.display = 'none'
		})
	})

	reject.addEventListener('click', () => {
		appRef.doc(docId).delete().then(() => {
			card.style.display = 'none'
		})
	})

	return card
}

// Insert
async function createQuotesCards() {

	// Get list of pending quotes
	let snapshot = await quotesRef.get()

	// Name array
	let nameArray = []

	let filesArray = await Promise.all(snapshot.docs.map(async (doc) => {

		// Data
		let data = doc.data()

		// Return list fo files in doc
		let files = await firebase.storage().ref().child('users').child(data.userId).child('projects').child(data.project).listAll()

		// Get url for each file and push to array
		let urlArray = await Promise.all(files.items.map(async (item) => {

			return await item.getDownloadURL()
		}))

		// Insert card
		quotesContainer.append(quoteCard(data.userId, doc.id, doc.data().project, urlArray))

	}));

	

	
	


}

function createProjectReviewCards() {
	projectsRef.get().then((snap) => {

		// Make title visible
		if (!snap.empty) {
			projectReviewTitle.style.display = 'block'
		}

		snap.forEach((doc) => {

			// Append everything
			projectReviewContainer.append(projectReviewCard(doc.data(), doc.id))

		});
	})
}

function createRenderCard() {

	renderRef.get().then((snap) => {

		// Make title visible
		if (!snap.empty) {
			renderTitle.style.display = 'block'
		}

		snap.forEach((doc) => {

			// Append everything
			renderContainer.append(renderCard(doc.data(), doc.id))

		});
	})
}

function createVerificationCard() {

	appRef.get().then((snap) => {

		// Make title visible
		if (!snap.empty) {
			verificationTitle.style.display = 'block'
		}

		snap.forEach((doc) => {

			// Append everything
			verificationContainer.append(verificationCard(doc.data(), doc.id))

		});
	})
}


// Sonstiges
function removeSpinner() {
	// Get elements
	const verifyText = document.querySelector('.verify-text')
	const spinner = document.querySelector('.verify-loading')

	spinner.style.display = 'none'
	verifyText.style.display = 'none'
}

function saveBlob(blob, fileName) {
	var a = document.createElement('a');
	a.href = window.URL.createObjectURL(blob);
	a.download = fileName;
	a.dispatchEvent(new MouseEvent('click'));
}

async function finalizeProject(data, docId, element, thumbnailURL) {

	// Update user ref to 'Completed'
	await firebase.firestore().collection("users").doc(data.ownerId).collection('projects').doc(data.projectName)
		.update({
			status: 'Completed',
			thumbnail: thumbnailURL
		})


	// Move project from in Review(pending) to completed(artist)
	await firebase.firestore().collection('artists').doc(data.ownerId).collection('completed').doc(docId).set({
		ownerId: data.ownerId,
		projectName: data.projectName,
		submissionTimestamp: data.submissionTimestamp,
		approvedTimestamp: Date.now()
	})
	await firebase.firestore().collection('pending').doc('inReview').collection('projects').doc(docId).delete()

	// Send notification to user
	let payload = { userId: data.ownerId, project: data.projectName }
	await notifyProjectCompleted(payload)
	console.log('notification sent')

	// Animate
	element.style.opacity = '0'
	setTimeout(() => { element.style.display = 'none' }, 300)

	if (element.parentNode.childElementCount < 2) {
		projectReviewTitle.style.display = 'none'
	}

}

// Admin
function setToggle(element, ref, key) {

	// Get project creation status reference
	ref.get().then((docRef) => {

		let data = docRef.data()

		if (data[key] === true) {
			return element.classList.add('panel-toggle_active')
		} else {
			return element.classList.add('panel-toggle_inactive')
		}
	})
}




