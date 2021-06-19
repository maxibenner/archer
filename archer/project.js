// _____________________ Elements ________________________ //

const title = document.getElementById("project-title");
const renders = document.getElementById("previous-renders");

const container = document.querySelector(".scene");
const spinner = document.getElementById("global--loader");
const modelPreview = document.getElementById("model-download");
const downloadPreviewIndicator = document.getElementById(
  "preview-download-indicator"
);
const batchContainer = document.querySelector(
  ".project--image-batches-container"
);
const noImagesPlaceholder = document.getElementById(
  "project--no-images-placeholder"
);
const imageDownloadLoader = document.querySelector(".image-download-loader");

/* Cart */
const cartCounter = document.querySelector("#global--cart-icon-count");
const cartItemContainer = document.querySelector(
  "#global-cart-body-container-items"
);

// UI
const titleTag = document.getElementById("project--title-tag");
const downloadModelContainer = document.getElementById(
  "project-model-download-container"
);
const quoteText = document.getElementById("project--quote-text");
const quotePlaceholer = document.getElementById("project--quote-placeholder");
const quoteContainer = document.getElementById("project--quote-container");
const quotePriceContainer = document.getElementById("project--quote-price");
const quoteTurnaroundContainer = document.getElementById(
  "project--quote-turnaround"
);
const quoteButtonBox = document.getElementById(
  "project--quote-button-container"
);

// Buttons
const button = document.getElementById("order-images-button");
const buttonAccept = document.getElementById("project--quote-button-accept");
const buttonDecline = document.getElementById("project--quote-button-decline");

// Progress Circle
const circleLoader = document.getElementById("global--progress-ring");
const circleLoaderCircle = circleLoader.querySelector("circle");

// _____________________ Values ________________________ //

// General
let projectName = sessionStorage.getItem("project");

/*__________________________ Init Cart ___________________________*/
setCartCounter(cartCounter);
populateCart(cartItemContainer);

// _____________________ Init ________________________ //
title.innerText = projectName;
let userId;
let quoteProjectData;

// firebase.auth().onAuthStateChanged(function (user) {
//   if (user) {
//     userId = user.uid;

//     //setImage(userId, projectName)
//     setRenders(userId, batchContainer);

//     if (sessionStorage.getItem("project--type") === "project") {
//       init3D();
//       setProjectUI();
//     }
//     if (sessionStorage.getItem("project--type") === "quote") {
//       firebase
//         .firestore()
//         .collection("users")
//         .doc(userId)
//         .collection("projects")
//         .doc(projectName)
//         .get()
//         .then((doc) => {
//           setQuoteUI(doc.data());

//           quoteProjectData = doc.data();
//         });
//     }
//   }
// });

// DEMMO
setTimeout(() => {
  init3D();
  setProjectUI();
}, 500);

//_____________

// _____________________ Listeners ________________________ //

// Order Images Click
button.addEventListener("click", () => {
  sessionStorage.setItem("pushDelete", sessionStorage.getItem("project"));
  window.location.href = "./scenes.html";
});

// Download 3d Model
modelPreview.addEventListener("click", () => {
  let dl = document.createElement("a");
  dl.setAttribute("href", "/studio/model.glb");
  dl.setAttribute("download", "sample.glb");
  dl.click();
  dl.remove();
  // DEMO: let modelRef;

  // // Get correct model
  // if (sessionStorage.getItem("sample") === true) {
  //   modelRef = firebase
  //     .storage()
  //     .ref()
  //     .child("users")
  //     .child(userId)
  //     .child("projects")
  //     .child(sessionStorage.getItem("project"))
  //     .child("modelFiles");
  // } else {
  //   modelRef = firebase.storage().ref().child("globalFiles");
  // }

  // // Download file
  // modelRef
  //   .child("model.glb")
  //   .getDownloadURL()
  //   .then((url) => {
  //     // This can be downloaded directly:
  //     var xhr = new XMLHttpRequest();
  //     xhr.responseType = "blob";
  //     xhr.onload = function (event) {
  //       var blob = xhr.response;
  //       saveBlob(blob, sessionStorage.getItem("project") + ".glb");
  //     };
  //     xhr.onprogress = function (event) {};

  //     xhr.open("GET", url);
  //     xhr.send();
  //   })
  //   .catch(function (error) {
  //     // Handle any errors
  //     console.log(error);
  //   });
});

// Accept quote
buttonAccept.addEventListener("click", () => {
  // Get project name
  let projectName = sessionStorage.getItem("project");

  // Get cart item
  let cartItemString = localStorage.getItem("cartItems");
  let cartItemObject = JSON.parse(cartItemString);

  if (cartItemString != null) {
    // Check if project is already in cart
    let documentArray = cartItemObject.projects.filter((element) => {
      return element.projectName === projectName;
    });

    if (documentArray.length >= 1) {
      // Go to checkout
      window.location.href = "./checkout.html";
    } else {
      // Ad to cart
      addProjectToLocalStorage(projectName, quoteProjectData.price);
    }
  } else {
    // Ad to cart
    addProjectToLocalStorage(projectName, quoteProjectData.price);

    // Go to checkout
    window.location.href = "./checkout.html";
  }
});

// Decline quote
buttonDecline.addEventListener("click", async () => {
  // Delete from quote dir
  firebase
    .firestore()
    .collection("pending")
    .doc("quotes")
    .collection("projects")
    .doc(userId + projectName)
    .delete()
    .then(() => {
      // Delete doc from user
      firebase
        .firestore()
        .collection("users")
        .doc(userId)
        .collection("projects")
        .doc(projectName)
        .delete();
    })
    .then(() => {
      // Back to dashboard
      window.location.href = "./dashboard.html";
    });
});

// _____________________ Functions ________________________ //

// Save to computer
function saveBlob(blob, fileName) {
  var a = document.createElement("a");
  a.href = window.URL.createObjectURL(blob);
  a.download = fileName;
  a.dispatchEvent(new MouseEvent("click"));
}

// Set image
function setImage(userId, projectName) {
  // Get image storage reference
  let previewRef = firebase
    .storage()
    .ref()
    .child("users")
    .child(userId)
    .child("projects")
    .child(projectName)
    .child("modelFiles")
    .child("preview.png");

  // Insert Image
  previewRef
    .getDownloadURL()
    .then((url) => {
      container.style["background-image"] = "url(" + url + ")";
    })
    .catch((err) => {
      console.log(err);
    })
    .then(() => {
      spinner.style.display = "none";
    })
    .catch((err) => {
      console.log(err);
    });
}

// Set renders
async function setRenders(userId, container) {
  // Render collection reference
  //DEMO: let renderRef = await firebase
  //   .firestore()
  //   .collection("users")
  //   .doc(userId)
  //   .collection("renders")
  //   .get();

  // CREATE BATCHES
  let renderBatches = [];

  //DEMO
  let renderRef = [
    {
      id: "ecom",
      render: { projectName: "sample", sceneName: "Ecom" },
      status: "Completed",
      timeOfSubmission: 1624025511870,
    },
    {
      id: "colorful",
      render: { projectName: "sample", sceneName: "Leaves" },
      status: "progress",
      timeOfSubmission: 1624025561870,
    },
  ];
  //______

  // Add to batches array
  renderRef.forEach((doc) => {
    //DEMO:let renderData = doc.data();
    let renderData = doc;
    //_______

    // Filter for correct project
    if (renderData.render.projectName === projectName) {
      // Remove placeholder
      //DEMO:if (doc.data().length !== 0) {
      noImagesPlaceholder.style.display = "none";
      //DEMO:}

      // Filter for uniqueness
      if (renderBatches.includes(renderData.timeOfSubmission)) {
        // Do nothing
      } else {
        renderBatches.push(renderData.timeOfSubmission);

        // Create batch container + date title
        let batch = document.createElement("div");
        batch.setAttribute("class", "image-batch-container");

        let date = document.createElement("h3");
        date.textContent = moment(renderData.timeOfSubmission)
          .local()
          .format("MMMM Do - HH:mm");
        batch.append(date);

        let containerInner = document.createElement("div");
        containerInner.setAttribute("id", renderData.timeOfSubmission);
        containerInner.setAttribute("class", "batch-container-inner");
        batch.append(containerInner);

        container.append(batch);
      }
    }
  });

  // Assign images to batches
  renderRef.forEach((doc) => {
    //DEMO:let renderData = doc.data();
    let renderData = doc;
    //_______

    // Filter for correct project
    if (renderData.render.projectName === projectName) {
      // Get corresponding batch
      let batch = document.getElementById(renderData.timeOfSubmission);

      // Create element
      let filesContainer = document.createElement("div");
      filesContainer.setAttribute("meta", doc.id);
      batch.append(filesContainer);

      let scene = document.createElement("p");
      scene.textContent = renderData.render.sceneName;
      filesContainer.append(scene);

      let detail = document.createElement("p");
      detail.textContent = null;
      filesContainer.append(detail);

      if (renderData.status === "progress") {
        filesContainer.classList.add("renders-progress");

        // Add "in-progress" note
        let note = document.createElement("p");
        note.textContent = "In Progress";
        filesContainer.append(note);
      } else {
        let imgContainer = document.createElement("div");
        filesContainer.append(imgContainer);

        // Add download button
        let img = document.createElement("img");
        img.setAttribute("src", "./icons/download.svg");
        img.setAttribute("class", "styles--icon-inline-1 preview-icon");
        imgContainer.append(img);

        // Click Listener
        img.addEventListener("click", () => {
          console.log(sessionStorage.getItem("project"));
          //DEMO: let imgRef = firebase
          //   .storage()
          //   .ref()
          //   .child("users")
          //   .child(userId)
          //   .child("projects")
          //   .child(sessionStorage.getItem("project"))
          //   .child("images");

          // Exchange download icon for percentage
          //DEMO: imgContainer.removeChild(img);
          // let progressTracker = document.createElement("p");
          // progressTracker.textContent = "0%";
          // progressTracker.classList.add("disable-select");
          // imgContainer.append(progressTracker);

          // Download file
          let dl = document.createElement("a");
          dl.setAttribute("href", "/images/render.png");
          dl.setAttribute("download", "render.png");
          dl.click();
          dl.remove();
          //DEMO: imgRef
          //   .child(doc.id + ".png")
          //   .getDownloadURL()
          //   .then((url) => {
          //     // This can be downloaded directly:
          //     var xhr = new XMLHttpRequest();
          //     xhr.responseType = "blob";

          //     xhr.onload = function (event) {
          //       var blob = xhr.response;
          //       //downloadPreview.style.display = 'none'
          //       saveBlob(
          //         blob,
          //         sessionStorage.getItem("project") + "_" + doc.id + ".png"
          //       );

          //       // Exchange progress for download icon
          //       imgContainer.removeChild(progressTracker);
          //       imgContainer.append(img);
          //     };
          //     xhr.onprogress = function (event) {
          //       let progress = Math.floor((event.loaded / event.total) * 100);
          //       progressTracker.textContent = progress + "%";
          //     };
          //     xhr.open("GET", url);
          //     xhr.send();
          //   })
          //   .catch(function (error) {
          //     // Handle any errors
          //     console.log(error);
          //   });
        });
      }
    }
  });
}

/*DEMO: */ setRenders("demo", batchContainer);

// Set quote UI
function setQuoteUI(projectDoc) {
  const UIArray = [
    quoteText,
    titleTag,
    quotePlaceholer,
    quoteContainer,
    quoteButtonBox,
  ];

  UIArray.forEach((element) => {
    element.style.display = "flex";
  });

  // Set quote price and turnaround
  quotePriceContainer.textContent = "$" + projectDoc.price;
  quoteTurnaroundContainer.textContent = "48 hours";
}
function setProjectUI() {
  button.style.display = "flex";
  noImagesPlaceholder.style.display = "flex";
  downloadModelContainer.style.display = "flex";
  circleLoader.style.display = "block";
}

/* Progress circle */
const radius = circleLoaderCircle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

circleLoaderCircle.style.strokeDasharray = `${circumference} ${circumference}`;
circleLoaderCircle.style.strokeDashoffset = circumference;

function setProgress(percent) {
  const offset = 213 - (percent / 100) * 213;
  circleLoaderCircle.style.strokeDashoffset = offset;
}

// _____________________ ThreeJS ________________________ //

let camera;
let renderer;
let scene;
let set;
let model;
let center;
let bbox;
let pivot;

// Loaders
THREE.DefaultLoadingManager.onLoad = function () {
  // Loader
  circleLoader.style.display = "none";
};

async function init3D() {
  THREE.Cache.enabled = true;

  // Set path variable
  let glbPath;
  // Get correct model path
  if (sessionStorage.getItem("sample") === "false") {
    glbPath = await firebase
      .storage()
      .ref()
      .child("users")
      .child(userId)
      .child("projects")
      .child(sessionStorage.getItem("project"))
      .child("modelFiles")
      .child("model.glb")
      .getDownloadURL();
  } else {
    //glbPath = await firebase.storage().ref().child('globalFiles').child('model.glb').getDownloadURL()
    glbPath = "/studio/model.glb";
  }

  // Create Scene
  scene = new THREE.Scene();

  const fov = 35;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.1;
  const far = 500;

  // Hemisphere Light
  var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.1);
  scene.add(hemiLight);

  // Spot Light
  var spotLight = new THREE.SpotLight(0xffffff, 0.1);
  spotLight.castShadow = true;
  spotLight.position.set(2, 2, 2);

  spotLight.angle = Math.PI * 0.1;

  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 4;
  spotLight.shadow.bias = -0.002;
  spotLight.shadow.mapSize.set(1024, 1024);
  scene.add(spotLight);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  // Accurate Colors
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Env Image
  let cubeLoader = new THREE.CubeTextureLoader();
  scene.environment = cubeLoader.load([
    "./images/envMap/posx.jpg",
    "./images/envMap/negx.jpg",
    "./images/envMap/posy.jpg",
    "./images/envMap/negy.jpg",
    "./images/envMap/posz.jpg",
    "./images/envMap/negz.jpg",
  ]);

  // Load Model
  let loader = new THREE.GLTFLoader();

  // Model
  loader.load(
    glbPath,
    function (gltf) {
      model = gltf.scene;

      // Create bounding box from model
      bbox = new THREE.Box3().setFromObject(model);

      // Get size vector from bounding box
      let size = bbox.getSize(new THREE.Vector3());

      // Get longest side of bounding box
      let maxSide = Math.max(size.x, size.y, size.z);

      // Rescale model
      model.scale.multiplyScalar(1 / maxSide);

      // Update bounding box
      bbox = new THREE.Box3().setFromObject(model);
      size = bbox.getSize(new THREE.Vector3());

      // Get center vector from new bounding box
      center = bbox.getCenter(new THREE.Vector3());

      // Set geometry center to center of bounding box
      model.position.sub(center);

      // Accept shadows
      model.traverse((n) => {
        if (n.isMesh) {
          //n.material = new THREE.MeshStandardMaterial({color: 0x6f6f6f});
          n.castShadow = true;
          n.receiveShadow = true;
        }
      });

      scene.add(model);

      // Center pivot point
      pivot = new THREE.Object3D();

      pivot.add(model);
      scene.add(pivot);
      pivot.position.set(0, size.y / 2, 0);

      // Camera Setup
      camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.copy(0);
      camera.position.set(0, size.y / 2, 3);
      camera.lookAt(0, size.y / 2, 0);
      camera.updateProjectionMatrix();
      //camera.lookAt()

      animate();

      // Add to DOM
      container.appendChild(renderer.domElement);
    },
    // called while loading is progressing
    function (xhr) {
      setProgress((xhr.loaded / xhr.total) * 100);
    },
    // called when loading has errors
    function (error) {
      console.log(error);
    }
  );
}

function animate() {
  requestAnimationFrame(animate);
  pivot.rotation.y -= 0.005;
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
}

// Window Resize
window.addEventListener("resize", onWindowResize);
