/*___________________ Set Prices (Display Only, this doesn't affect the actual prices charged) ____*/
let globalProjectPrice = 90;
let globalRenderPrice = 10;

// Get elements
const navLogout = document.querySelector("#nav--logout");
const navLogo = document.querySelector(".nav--logo");

/*___________________ Indicate dev mode __________________________*/
/*if(window.location.hostname !== 'fotura.co' && window.location.hostname !== 'pro.fotura' && window.location.hostname !== 'admin.fotura'){

    // Create indicator
    let indicator = document.createElement('div')
    indicator.textContent = 'dev'
    indicator.setAttribute('class','global--dev-mode-indicator')
    document.querySelector('body').append(indicator)
}*/

/*___________________ Maintenance __________________________*/
/*if(window.location.hostname !== 'fotura.co' && window.location.hostname !== 'pro.fotura' && window.location.hostname !== 'admin.fotura'){

    
}*/

/*___________________ Sign Out __________________________*/
if (navLogout) {
  navLogout.addEventListener("click", () => {
    window.location.pathname = "/";
    //DEMO:   firebase
    //     .auth()
    //     .signOut()
    //     .then(() => {
    //       // Sign-out successful.
    //     })
    //     .catch(function (error) {
    //       // An error happened.
    //       console.log(error);
    //     });
  });
}

/*____________________ Track Auth State ______________________*/
// firebase.auth().onAuthStateChanged(function (user) {
//   if (user) {
//     console.log(user.email);
//   } else {
//     console.log("logged out");
//     if (
//       window.location.pathname !== "/" &&
//       window.location.pathname !== "/pricing.html" &&
//       window.location.pathname !== "/sign-in.html" &&
//       window.location.pathname !== "/sign-up.html" &&
//       window.location.pathname !== "/resetpw.html"
//     ) {
//       console.log(window.location.pathname);
//       window.location.pathname = "/";
//     }
//   }
// });

/*____________________ Mobile menu logic ______________________*/
const hamburgerMenu = document.querySelector("#nav--menu");
const hamburger = document.querySelector("#nav--menu-button");
const hamburgerBarA = document.querySelector("#hamburger--bar-a");
const hamburgerBarB = document.querySelector("#hamburger--bar-b");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    if (!hamburger.classList.contains("active")) {
      hamburgerBarA.style.width = "40px";
      hamburgerBarB.style.width = "40px";
      hamburgerMenu.style.left = "0";
      hamburger.classList.add("active");
      document.body.style.overflow = "hidden";
    } else {
      hamburgerBarA.style.width = "30px";
      hamburgerBarB.style.width = "20px";
      hamburgerMenu.style.left = "100%";
      hamburger.classList.remove("active");
      document.body.style.overflow = "unset";
    }
  });
}

/*____________________ Cart ______________________*/
const cartButton = document.getElementById("global--cart-icon");
const cartBody = document.getElementById("global--cart-body");
const cartCounterDisplay = document.getElementById("global--cart-icon-count");
const cartIcon = document.getElementById("global--cart-icon");

// Open/Close Cart
if (cartButton) {
  cartButton.addEventListener("click", () => {
    cartBody.classList.toggle("global--flex");
  });
}

/*____________________ Listeners ______________________*/
// Set logo link
navLogo.addEventListener("click", () => {
  //DEMO: if (
  //   window.location.href === "./pricing.html" ||
  //   window.location.href === "./sign-in.html" ||
  //   window.location.href === "./sign-up.html" ||
  //   window.location.href === "./resetpw.html"
  // ) {
  //   window.location.pathname = "/";
  // } else {
  //   window.location.href = "./dashboard.html";
  // }
  window.location.pathname = "/";
  // DEMO_____
});

/*____________________ Functions ______________________*/

// Handle cart counter
function setCartCounter(cartCounter) {
  if (localStorage.getItem("cartItems")) {
    let cartContentString = localStorage.getItem("cartItems");
    let cartContentObject = JSON.parse(cartContentString);

    if (
      cartContentObject.projects.length > 0 ||
      Object.entries(cartContentObject.renders).length > 0
    ) {
      let numberOfCartItems =
        cartContentObject.projects.length +
        Object.entries(cartContentObject.renders).length;
      cartCounter.textContent = numberOfCartItems;
      cartCounter.style.opacity = "1";
    } else {
      cartCounter.style.opacity = 0;
    }
  }
}

// Add project to local storage
function addProjectToLocalStorage(projectName, price) {
  let projectObject = { projectName: projectName, price: price };

  if (localStorage.getItem("cartItems")) {
    let cartContentString = localStorage.getItem("cartItems");
    let cartContentObject = JSON.parse(cartContentString);

    if (!cartContentObject.projects.includes(projectName)) {
      cartContentObject.projects.push(projectObject);
      let cartContentStringUpdated = JSON.stringify(cartContentObject);

      localStorage.setItem("cartItems", cartContentStringUpdated);
    }
  } else {
    let cartContentObject = {
      projects: [projectObject],
      renders: [],
    };

    let cartContentString = JSON.stringify(cartContentObject);
    window.localStorage.setItem("cartItems", cartContentString);
  }
}

// Populate Cart
function populateCart(itemsContainer) {
  if (window.localStorage.getItem("cartItems") !== null) {
    let cartContentString = window.localStorage.getItem("cartItems");
    let cartContentObject = JSON.parse(cartContentString);

    let numberOfProjects;
    let numberOfRenders;

    let numberOfCartItems =
      cartContentObject.projects.length + cartContentObject.renders.length;

    if (numberOfCartItems > 0) {
      // First, remove nodes
      itemsContainer.querySelectorAll("*").forEach((n) => n.remove());

      // Make elements visible
      itemsContainer.parentElement.querySelector(
        ".global--cart-total"
      ).style.display = "flex";
      itemsContainer.parentElement.querySelector("a").style.display = "block";

      // Add icon
      itemsContainer.parentElement.parentElement.style.display = "unset";

      let cartProjectsArray = cartContentObject.projects;
      let cartRendersArray = cartContentObject.renders;

      // Add project to cart
      cartProjectsArray.forEach((project) => {
        createCartItem(project.projectName, itemsContainer, "project");
      });

      // Add renders to cart
      cartRendersArray.forEach((render) => {
        createCartItem(
          render.sceneName,
          itemsContainer,
          "render",
          render.uid,
          render.thumbImgDataUrl
        );
      });

      // Set cart total price
      let totalPrice = document.querySelector("#global--cart-total-price");
      let priceProjects =
        cartContentObject.projects.length * globalProjectPrice;
      let priceRenders = cartContentObject.renders.length * globalRenderPrice;
      // Account for samples
      let sampleItems =
        cartContentObject.renders.filter((element) => element.sample === "true")
          .length * globalRenderPrice;

      totalPrice.innerHTML = priceProjects + priceRenders - sampleItems;
    } else {
      // First, remove nodes
      itemsContainer.querySelectorAll("*").forEach((n) => n.remove());

      // Remove icon
      itemsContainer.parentElement.parentElement.querySelector(
        "#global--cart-icon > div"
      ).style.opcaity = "0";
      itemsContainer.parentElement.parentElement.style.cursor = "default";

      // Hide elements
      itemsContainer.parentElement.querySelector(
        ".global--cart-total"
      ).style.display = "none";
      itemsContainer.parentElement.querySelector("a").style.display = "none";

      // Add placeholder
      let cartPlaceholder = document.createElement("div");
      itemsContainer.append(cartPlaceholder);
      cartPlaceholder.innerHTML = "Your cart is empty";
      cartPlaceholder.setAttribute("class", "cartPlaceholder");
    }
  } else {
    // Hide elements
    itemsContainer.parentElement.querySelector(
      ".global--cart-total"
    ).style.display = "none";
    itemsContainer.parentElement.querySelector("a").style.display = "none";

    // Add placeholder
    let cartPlaceholder = document.createElement("div");
    itemsContainer.append(cartPlaceholder);
    cartPlaceholder.innerHTML = "Your cart is empty";
    cartPlaceholder.setAttribute("class", "cartPlaceholder");
  }
}

// Create individual cart items and set values
function createCartItem(
  name,
  container,
  kind,
  optionalId,
  optionalThumbnailDataUrl
) {
  // Create Elements
  const itemsContainer = document.createElement("div");
  const itemThumbnail = document.createElement("img");
  const itemName = document.createElement("h3");
  const itemDetails = document.createElement("p");
  const itemDelete = document.createElement("img");

  // Append elements
  container.append(itemsContainer);
  if (kind !== "project") {
    itemsContainer.append(itemThumbnail);
  }
  itemsContainer.append(itemName);
  itemsContainer.append(itemDetails);
  itemsContainer.append(itemDelete);

  // Set attributes
  itemsContainer.setAttribute("class", "global--cart-item");
  itemsContainer.setAttribute("meta", kind);
  if (kind !== "project") {
    itemThumbnail.src = optionalThumbnailDataUrl;
    itemThumbnail.setAttribute("class", "global--cart-thumbnail");
  }
  itemName.innerHTML = name;
  itemDelete.setAttribute("src", "/icons/delete-grey.svg");
  itemDelete.setAttribute(
    "class",
    "styles--icon-inline global--cart-icon-delete"
  );

  // Add id for renders
  if (optionalId) {
    itemName.setAttribute("meta", optionalId);
  }

  // Add event listener
  addDeleteEventListener(itemDelete);
}

// Delete cart item (for cart only, not checkout)
function addDeleteEventListener(element) {
  element.addEventListener("click", () => {
    let kind = element.parentElement.attributes.meta.value;
    let name = element.parentElement.querySelector("h3").textContent;

    let cartContentString = localStorage.getItem("cartItems");
    let cartContentObject = JSON.parse(cartContentString);

    if (kind === "project") {
      let cartProjectsArrayUpdated = cartContentObject.projects.filter(
        (element) => element.projectName !== name
      );
      cartContentObject.projects = cartProjectsArrayUpdated;
    }
    if (kind === "render") {
      let id = element.parentElement.querySelector("h3").attributes.meta.value;
      let cartRendersArrayUpdated = cartContentObject.renders.filter(
        (element) => element.uid !== id
      );
      cartContentObject.renders = cartRendersArrayUpdated;
    }

    let cartContentStringUpdated = JSON.stringify(cartContentObject);
    localStorage.setItem("cartItems", cartContentStringUpdated);

    // Animation item removal
    element.parentElement.style.height = "0px";
    element.parentElement.style.background = "#F05C5B";
    element.parentElement.querySelectorAll("*").forEach((n) => n.remove());

    setTimeout(function () {
      populateCart(document.querySelector("#global-cart-body-container-items"));
      setCartCounter(document.querySelector("#global--cart-icon-count"));
    }, 200);
  });
}

// Animate between defined elements
function animateInOut(elementBefore, elementAfter, displayStyle, duration) {
  // Variables
  let timing = (duration / 2) * 1000;

  // Animation logic
  elementBefore.style.opacity = "0";
  setTimeout(() => {
    elementBefore.style.display = "none";
  }, timing);
  setTimeout(() => {
    elementAfter.style.display = displayStyle;
  }, timing);
  setTimeout(() => {
    elementAfter.style.opacity = "1";
  }, timing * 2);
}

// Download file from firestore reference
function download(ref) {
  let storageRef = firebase.storage().ref(ref);
  storageRef.getDownloadURL().then(function (downloadUrl) {
    console.log(downloadUrl);

    browser.download({
      url: downloadUrl,
      filename: "test.png",
      conflictAction: "uniquify",
    });
  });
}

// Create uuid
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Create dark overlay
function createGreyOverlay(target) {
  let bg = document.createElement("div");
  bg.setAttribute("class", "global--overlay-grey");
  target.append(bg);
  bg.classList.add("global--overlay-grey");
  bg.addEventListener;
}
