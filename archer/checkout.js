

//DEMO: let stripe
// if (window.location.hostname === 'fotura3d-dev.web.app' || window.location.hostname === 'localhost') { stripe = Stripe('pk_test_4FSoWDQxjp6vF5zCYfZvLBoD00iafDleLI') }
// if (window.location.hostname === 'fotura.co') { stripe = Stripe('pk_live_D9XAOs3hTjKt0qPloB7Toknc00kpmNB9tE') }
// const elements = stripe.elements();



/*_________________ Cloud Functions ____________________*/
//DMEO: const createPaymentIntent = firebase.functions().httpsCallable('createPaymentIntent')
// const updatePaymentIntent = firebase.functions().httpsCallable('updatePaymentIntent')
// const saveTaskDataToFirestore = firebase.functions().httpsCallable('saveTaskDataToFirestore')
// const deleteTaskDataFromFirestore = firebase.functions().httpsCallable('deleteTaskDataFromFirestore')
// const submitSampleData = firebase.functions().httpsCallable('submitSampleData')


/*___________________ Element References __________________________*/

const wrapper = document.getElementById('checkout--wrapper')
const pagewideLoader = document.getElementById('checkout--loader-pagewide')
const couponButton = document.querySelector('#checkout--payment-button-coupon')
const couponInput = document.querySelector('#checkout--payment-input-coupon')
const priceDisplays = document.querySelectorAll('.checkout--price')

//Payment
const buttonLock = document.querySelector('#payment-button-lock')
const buttonTxt = document.querySelector('#payment-button-txt')
const buttonSpinner = document.getElementById('checkout--loader-pay')

//Samples
const buttonLockSample = document.querySelector('#payment-button-lock-sample')
const buttonTxtSample = document.querySelector('#payment-button-txt-sample')
const buttonSpinnerSample = document.getElementById('checkout--loader-free')

const paymentBefore = document.getElementById('checkout-payment-before')
const paymentBeforeSample = document.getElementById('checkout-payment-before-sample')
const paymentAfter = document.getElementById('checkout-payment-after')
const cartContainer = document.querySelector('.checkout-cart-container')
const paymentContainer = document.querySelector('.checkout-payment-container')
const cartContainerInner = document.querySelector('.checkout-cart-container-inner')
const priceDisplayTotal = document.querySelector('.checkout-cart-total')
const cardElement = document.querySelector('#card-element')
const priceTotal = document.getElementById('checkout-cart-total-price')
let form = document.getElementById('payment-form')
let formSample = document.getElementById('payment-form-sample')
const checkoutEmpyMessage = document.getElementById('checkout-empty-message')
const checkoutPaymentContainer = document.getElementById('checkout-payment-container')

// CartView
let checkoutCartViewItems = document.querySelectorAll('.checkout-cart-item')
let checkoutProjectsContainer = document.querySelector('#checkout-cart-projects-container')
let checkoutRendersContainer = document.querySelector('#checkout-cart-renders-container')
let checkoutCartItemContainers = document.querySelectorAll('.checkout-cart-item-container')
let checkoutCartViewRenderTurnaround = document.getElementById('checkout--renders-turnaround')

// Groups
let checkoutCartGroupProjects = document.getElementById('checkout-cart-group-projects')
let checkoutCartGroupRenders = document.getElementById('checkout-cart-group-renders')


// Variables
let price = 0
let secret = ''
let paymentIntentId = ''
let userId


/*__________________________________ Init ____________________________________*/
//DEMO: firebase.auth().onAuthStateChanged(function (user) {
// 	if (user) {

// 		// Save user id
// 		userId = user.uid

// 		// Populate cart
// 		populateCartView()

// 	}
// })
populateCartView()
//_________

// Show loader 
//DEMO:pagewideLoader.style.display = 'block';

// Create Payment Intent (Only when items in cart)
if (localStorage.getItem('cartItems')) {

	// Create and wait for payment intent
	//DEMO:createPaymentIntent(localStorage.getItem('cartItems')).then(response => {

		// DEMO: secret = response.data.clientSecret
		// paymentIntentId = response.data.paymentIntent
		// sessionStorage.setItem('paymentIntentId', paymentIntentId)
		// console.log(response.data.amount)

		// Show elements
		//DEMO:if (response.data.amount === 0) {
			paymentBeforeSample.style.display = 'flex'
		//DEMO:} else {
		//DEMO:	paymentBefore.style.display = 'flex'
		//DEMO:}
		wrapper.style.opacity = 1;
		pagewideLoader.style.display = 'none';

	//DEMO:})
	cartContainer.style.display = 'flex'
	paymentContainer.style.display = 'flex'

	/*let arr = JSON.parse(localStorage.getItem('cartItems'))
	console.log(arr.renders.filter(element => element.sample === 'true').length)*/

} else {
	wrapper.style.opacity = 1;
	checkoutEmpyMessage.style.display = 'flex'
	checkoutEmpyMessage.style.opacity = '1'
	pagewideLoader.style.display = 'none';
}

// Set up Stripe.js and Elements to use in checkout form
var style = {
	base: {
		color: "#32325d",
		'fontSize': '16px',
	}
};
//DEMO:var card = elements.create("card", { style: style });
//card.mount("#card-element");


/*___________________ Submission Listeners __________________________*/
// Payment logic
form.addEventListener('submit', function (ev) {

	ev.preventDefault();

	// Variables
	let cartObject = JSON.parse(localStorage.getItem('cartItems'))

	// Show spinner
	buttonLock.style.display = 'none'
	buttonTxt.style.display = 'none'
	buttonSpinner.style.display = 'block'

	saveTaskDataToFirestore(localStorage.getItem('cartItems')).then(() => {

		stripe.confirmCardPayment(secret, {
			payment_method: {
				card: card,
				billing_details: {
					email: firebase.auth().currentUser.email
				}
			}
		}).then(function (result) {

			if (result.error) {

				// Payment error
				console.log(result.error.message);
				deleteTaskDataFromFirestore(localStorage.getItem('cartItems'))

				// Hide spinner
				buttonLock.style.display = 'block'
				buttonTxt.style.display = 'block'
				buttonSpinner.style.display = 'none'

				// Show error
				setTimeout(() => {
					window.alert(result.error.message)
				}, 300)


			} else {

				// The payment has been processed!
				console.log(result.paymentIntent.status)

				// Delete payment intent id from session storage
				sessionStorage.removeItem('paymentIntentId')

				// Delete active project from session storage
				sessionStorage.removeItem('project')
				sessionStorage.removeItem('scene')

				// Delete cart
				localStorage.removeItem('cartItems')

				// Hide spinner
				buttonLock.style.display = 'block'
				buttonTxt.style.display = 'block'
				buttonSpinner.style.display = 'none'

				if (result.paymentIntent.status === 'succeeded') {

					// Variables
					let timing = (.3 / 2) * 1000

					// Animation logic
					//Mobile
					if (window.innerWidth <= 700) {

						checkoutPaymentContainer.style.background = 'white'
						cartContainer.style.display = 'none'
						paymentBefore.style.display = 'none'
						paymentAfter.style.display = 'flex'

						setTimeout(() => {
							paymentAfter.style.opacity = '1'
						}, 300)

						//Desktop
					} else {

						checkoutPaymentContainer.style.background = 'white'
						paymentBefore.style.opacity = '0'
						cartContainerInner.style.opacity = '0'
						priceDisplayTotal.style.opacity = '0'

						setTimeout(() => {
							paymentBefore.style.display = 'none'
							cartContainer.style.width = '0px'
						}, timing)

						setTimeout(() => {
							paymentAfter.style.display = 'flex'
							paymentAfter.style.opacity = '1'
						}, timing * 4);

					}
				}
			}
		})
	})
})

// Sample submission logic
formSample.addEventListener('submit', (e) => {
	e.preventDefault()

	// Show spinner FIX
	buttonLockSample.style.display = 'none'
	buttonTxtSample.style.display = 'none'
	buttonSpinnerSample.style.display = 'block'

	// Change view
	submitSampleData(localStorage.getItem('cartItems')).then(function (result) {

		if (result.data.result === 'error') {

			// Hide spinner
			buttonLockSample.style.display = 'block'
			buttonTxtSample.style.display = 'block'
			buttonSpinnerSample.style.display = 'none'

			// Show error
			setTimeout(() => {
				window.alert(result.data.message)
			}, 300)


		} else {

			// Delete payment intent id from session storage if there was any
			sessionStorage.removeItem('paymentIntentId')

			// Delete active project from session storage
			sessionStorage.removeItem('project')
			sessionStorage.removeItem('scene')

			// Delete cart
			localStorage.removeItem('cartItems')

			// Hide spinner
			buttonLockSample.style.display = 'block'
			buttonTxtSample.style.display = 'block'
			buttonSpinnerSample.style.display = 'none'

			// Variables
			let timing = (.3 / 2) * 1000

			// Animation logic
			//Mobile
			if (window.innerWidth <= 700) {

				checkoutPaymentContainer.style.background = 'white'
				paymentBeforeSample.style.display = 'none'
				cartContainer.style.display = 'none'
				paymentBefore.style.display = 'none'
				paymentAfter.style.display = 'flex'

				setTimeout(() => {
					paymentAfter.style.opacity = '1'
				}, 300)

				//Desktop
			} else {

				checkoutPaymentContainer.style.background = 'white'
				cartContainerInner.style.opacity = '0'
				paymentBeforeSample.style.opacity = '0'
				priceDisplayTotal.style.opacity = '0'

				setTimeout(() => {
					cartContainer.style.width = '0px'
					paymentBeforeSample.style.display = 'none'
				}, timing)

				setTimeout(() => {
					paymentAfter.style.display = 'flex'
					paymentAfter.style.opacity = '1'
				}, timing * 4);
			}
		}
	})
})

//_____________________ VISUALS____________________________//

// Total Price Display for mobile
document.addEventListener("scroll", () => {
	if (window.scrollY >= ((cartContainer.offsetHeight) - ((window.innerHeight / 10) * 7))) {
		priceDisplayTotal.classList.add('checkout-cart-total-relative')
	} else {
		priceDisplayTotal.classList.remove('checkout-cart-total-relative')
	}
});
// Scroll
document.addEventListener('scroll', () => {
	if (window.scrollY >= ((cartContainer.offsetHeight) - ((window.innerHeight / 10) * 7))) {
		priceDisplayTotal.classList.add('checkout-cart-total-relative')
	} else {
		priceDisplayTotal.classList.remove('checkout-cart-total-relative')
	}
})

/*___________________ Functions __________________________*/

// Read local storage and populate checkout cart
async function populateCartView() {

	// First delete all nodes
	checkoutProjectsContainer.querySelectorAll('*').forEach(n => n.remove())
	checkoutRendersContainer.querySelectorAll('*').forEach(n => n.remove())

	let cartContentString = window.localStorage.getItem('cartItems')
	let cartContentObject = JSON.parse(cartContentString)

	// Stop populating if cart doesn't exists
	if (!cartContentObject) { return }

	let cartViewProjects = cartContentObject.projects
	let cartViewRenders = cartContentObject.renders

	// Clear items before repopulating
	checkoutCartViewItems.forEach((item) => {
		item.remove()
	})

	// Insert Projects
	for (i = 0; i < cartViewProjects.length; i++) {

		await createCartViewElementAndInsert(cartViewProjects[i].projectName, 'project', checkoutProjectsContainer, null, null, null, cartViewProjects[i].price)

	}

	// Insert Renders
	cartViewRenders.forEach((render => {
		let uniqueId = render.uid
		let sample = render.sample
		createCartViewElementAndInsert(render.sceneName, 'render', checkoutRendersContainer, uniqueId, render.thumbImgDataUrl, sample)
	}))

	// Set render turnaround
	checkoutCartViewRenderTurnaround.textContent = cartViewRenders.length * 5 + ' minutes'

	// Display or hide cart group
	checkoutCartItemContainers.forEach((container) => {
		if (container.children.length > 0) {
			container.parentElement.style.display = 'block'
		} else {
			container.parentElement.style.display = 'none'

		}
	})

	// Get totel project price
	let totalProjectPrice = 0;
	for (var i = 0; i < cartViewProjects.length; i++) {

		totalProjectPrice += parseFloat(cartViewProjects[i].price)

	}

	// Get number of sample renders in cart
	let sampleRendersInCart =  cartContentObject.renders.filter(element => element.sample === 'true').length

	// Set total price variable
	let priceRenders = ((cartViewRenders.length * globalRenderPrice) - (sampleRendersInCart * globalRenderPrice))
	let priceProjects = totalProjectPrice
	let totalCartPrice = priceRenders + priceProjects

	// Set price display
	setPriceDisplays(priceDisplays, totalCartPrice)
}

// Create item element and insert
async function createCartViewElementAndInsert(name, kind, itemContainer, optionalUid, optionalImgDataUrl, sample, price) {

	let cartItem = document.createElement('div')

	let cartItemDelete = document.createElement('img')
	let cartItemName = document.createElement('div')
	let cartItemImgContainer = document.createElement('div')
	let cartItemImg = document.createElement('img')
	let cartItemPrice = document.createElement('div')

	cartItem.append(cartItemImgContainer)
	cartItemImgContainer.append(cartItemImg)
	cartItem.append(cartItemName)
	cartItem.append(cartItemPrice)
	cartItem.append(cartItemDelete)

	cartItem.setAttribute('class', 'checkout-cart-item')
	cartItem.setAttribute('meta', kind)
	cartItemImgContainer.setAttribute('class','checkout--cart-item-img-container')
	cartItemImg.setAttribute('class', 'checkout--cart-item-img')
	cartItemName.setAttribute('class', 'name')
	cartItemDelete.setAttribute('src', './icons/delete-grey.svg')
	cartItemDelete.setAttribute('alt', 'delete icon')
	cartItemDelete.setAttribute('class', 'checkout--cart-item-delete')

	// Name
	cartItemName.textContent = name

	// Details + Price -> insert
	if (kind === 'render') {

		cartItemImg.src = optionalImgDataUrl

		// Account for sample renders
		if (sample === 'true') {
			cartItemPrice.textContent = '$' + 0
		} else {
			cartItemPrice.textContent = '$' + globalRenderPrice
		}

		itemContainer.append(cartItem)

	} else {

		// Set thumbnail
		cartItemImg.src = './icons/category-product.svg'
		cartItemImgContainer.style.height = '25px'

		// Get price from firestore document
		cartItemPrice.textContent = '$' + price
		itemContainer.append(cartItem)

	}

	// Add id for renders
	if (optionalUid) {
		cartItemName.setAttribute('meta', optionalUid)
	}

	// Add event listener
	addCheckoutDeleteEventListener(cartItemDelete)

}

// Set price displays
function setPriceDisplays(priceDisplays, price) {

	priceDisplays.forEach((display) => {
		display.textContent = `$${price}`
	})
}

// Add event listener to delete button of checkout item
function addCheckoutDeleteEventListener(element) {
	element.addEventListener('click', () => {

		let kind = element.parentElement.attributes.meta.value
		let name = element.parentElement.querySelector('.name').textContent

		let cartContentString = localStorage.getItem('cartItems')
		let cartContentObject = JSON.parse(cartContentString)

		if (kind === 'project') {
			let cartProjectsArrayUpdated = cartContentObject.projects.filter((element) => element.projectName !== name)
			cartContentObject.projects = cartProjectsArrayUpdated

		}

		if (kind === 'render') {
			let uid = element.parentElement.querySelector('.name').attributes.meta.value
			let cartRendersArrayUpdated = cartContentObject.renders.filter((element) => element.uid !== uid)
			cartContentObject.renders = cartRendersArrayUpdated
		}

		let cartContentStringUpdated = JSON.stringify(cartContentObject)
		localStorage.setItem('cartItems', cartContentStringUpdated)

		// Update payment intent
		//DEMO: setUpcreatePaymentIntent()

		// Animation item removal
		element.parentElement.style.height = '0px'
		element.parentElement.style.background = '#F05C5B'
		element.parentElement.querySelectorAll('*').forEach(n => n.remove())

		setTimeout(() => { populateCartView() }, 300)

		// Check for sample projects
		let sampleRenders = cartContentObject.renders.filter(element => element.sample === 'true')
		let totalRenders = cartContentObject.renders

		if (sampleRenders.length > 0 && totalRenders.length - sampleRenders.length < 1) {
			paymentBefore.style.display = 'none'
			paymentBeforeSample.style.display = 'flex'
		} else {
			paymentBefore.style.display = 'flex'
			paymentBeforeSample.style.display = 'none'
		}

		// If cart is empty, remove cart from local storage
		if ((cartContentObject.renders.length + cartContentObject.projects.length) === 0) {

			// Remove cart item
			localStorage.removeItem('cartItems')

			// Variables
			let timing = (.3 / 2) * 1000


			// Animation logic
			//Mobile
			if (window.innerWidth <= 700) {

				checkoutPaymentContainer.style.background = 'white'
				cartContainer.style.display = 'none'
				paymentBefore.style.display = 'none'
				paymentBeforeSample.style.display = 'none'
				checkoutEmpyMessage.style.display = 'flex'

				setTimeout(() => {
					checkoutEmpyMessage.style.opacity = '1'
				}, 300)

				//Desktop
			} else {

				checkoutPaymentContainer.style.background = 'white'
				paymentBefore.style.opacity = '0'
				paymentBeforeSample.style.opacity = '0'
				cartContainerInner.style.opacity = '0'
				priceDisplayTotal.style.opacity = '0'

				setTimeout(() => {
					checkoutEmpyMessage.style.display = 'none'
					cartContainer.style.width = '0px'
				}, timing)

				setTimeout(() => {
					checkoutEmpyMessage.style.display = 'flex'
					checkoutEmpyMessage.style.opacity = '1'
				}, timing * 4);
			}
		}
	})
}

// Update Payment Intent
function setUpcreatePaymentIntent() {

	let object = { 'cart': localStorage.getItem('cartItems'), 'paymentIntentId': paymentIntentId }
	updatePaymentIntent(object).then(response => {
		console.log(response.data.amount)
	})
}































