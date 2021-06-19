/*__________________________ Elements ___________________________*/
// General
const placeholder = document.querySelector(".dashboard--placeholder-container");
const content = document.querySelector("#dashboard--add-project");
const buttonAddProject = document.querySelector("#dashboard--add-project");
const placeholderButton = document.querySelector(
  "#dashboard--placeholder-button"
);
const cartCounter = document.querySelector("#global--cart-icon-count");
const cartItemContainer = document.querySelector(
  "#global-cart-body-container-items"
);

// Project Delete Popup
const popupClose = document.querySelector(
  "#dashboard--delete-body-button-cancel"
);
const popup = document.querySelector("#dashboard--delete-container");
const popupBG = document.querySelector("#dashboard--delete-bg");
const popupInput = document.querySelector("#dashboard--delete-body-input");
const popupDelete = document.querySelector(
  "#dashboard--delete-body-button-delete"
);
const popupProjectName = document.querySelector(
  "#dashboard--delete-body-project-name"
);

// Add Project
const addProjectForm = document.getElementById("dashboard--add-product-form");
const projectBlockerNotice = document.querySelector(
  ".dashboard--project-creation-notice"
);
const projectBlockerNoticeClose = document.getElementById(
  "project-creation-notice-close-icon"
);

// Project Choice
const popupProjectChoice = document.getElementById("dashboard--popup-choice");
const popupProjectChoiceCreate = document.getElementById(
  "dashboard--popup-choice-create"
);

/*____________________ References ______________________*/
//DEMO:const blockerRef = firebase.firestore().collection("settings").doc("blockers");

/*__________________________ Variables ___________________________*/
let activeProject = sessionStorage.getItem("activeProject");
let projectForDeletion;
let projectCreation;

/*____________________ Track Auth State ______________________*/
let userId;
// firebase.auth().onAuthStateChanged((user) => {
//   if (user) {
//     userId = user.uid;
//     firebase
//       .firestore()
//       .collection("users")
//       .doc(userId)
//       .collection("projects")
//       .onSnapshot(() => {
//         addProjectCard();
//       });
//     checkProjectBlocker();
//   }
// });

// DEMO
//DEMO:addProjectCard();
//DEMO:checkProjectBlocker();
//____________

/*__________________________ Init ___________________________*/
setCartCounter(cartCounter);
populateCart(cartItemContainer);

/*__________________________ Listeners ___________________________*/

// Listen for add product
addProjectForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //DEMO
  window.location.href = "create.html";
  //______
  //DEMO: if (projectCreation === true) {
  //   window.location.href = "create.html";
  // } else {
  //   projectBlockerNotice.style.display = "initial";
  // }
});

// Project blocker close
projectBlockerNoticeClose.addEventListener("click", () => {
  projectBlockerNotice.style.display = "none";
});

// Listen for placeholder click
placeholderButton.addEventListener("click", () => {
  if (projectCreation === true) {
    window.location.href = "create.html";
  } else {
    projectBlockerNotice.style.display = "initial";
  }
});

// Listen for popup cancel
popupClose.addEventListener("click", () => {
  // Clear input before closing
  popupInput.value = "";

  setTimeout(function () {
    popupBG.style.display = "none";
    popup.style.display = "none";
  }, 200);

  popupBG.style.opacity = "0";
  popup.style.opacity = "0";
  popup.style.transform = "scale(0.9) translate(-50%, -50%)";
});

// Listen for popup input for delete button style changes
popupInput.addEventListener("keyup", () => {
  if (popupInput.value === projectForDeletion) {
    popupDelete.style.background = "#F5605E";
    popupDelete.style.color = "var(--light)";
    popupDelete.style.cursor = "pointer";
  } else {
    popupDelete.style.background = "var(--lightestGrey)";
    popupDelete.style.color = "var(--placeholder)";
    popupDelete.style.cursor = "default";
  }
});

// Listen for project delete click
popupDelete.addEventListener("click", (element) => {
  let projectWitoutWhitespace = projectForDeletion.replace(/\s/g, "-");
  let card = document.querySelector(
    "#dashboard--project-container-" + projectWitoutWhitespace
  );
  let name = sessionStorage.getItem("projectForDeletion");
  let projectRefRendersProgress = firebase
    .firestore()
    .collection("users")
    .doc(userId)
    .collection("renders")
    .where("projectName", "==", projectForDeletion)
    .where("status", "==", "progress");

  // Check for pending renders first
  projectRefRendersProgress.get().then((docs) => {
    if (docs.empty) {
      if (popupInput.value == projectForDeletion) {
        // Reset UI
        popupClose.click();

        // Get storage refs
        var storageRefParent = firebase
          .storage()
          .ref("users/" + userId + "/" + "projects/" + projectForDeletion);
        var storageRefModelFiles = firebase
          .storage()
          .ref(
            "users/" +
              userId +
              "/" +
              "projects/" +
              projectForDeletion +
              "/modelFiles"
          );
        var storageRefImages = firebase
          .storage()
          .ref(
            "users/" +
              userId +
              "/" +
              "projects/" +
              projectForDeletion +
              "/images"
          );

        // Get firestore refs
        let sampleTrackerRef = firebase
          .firestore()
          .collection("data")
          .doc(userId);
        let projectRef = firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("projects")
          .doc(projectForDeletion);
        let projectRefRenders = firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("renders")
          .where("projectName", "==", projectForDeletion);

        projectRef.get().then(async (doc) => {
          //REFRESH CART
          let cartContentString = localStorage.getItem("cartItems");
          let cartContentObject = JSON.parse(cartContentString);

          // Remove project from cart
          if (cartContentObject) {
            let cartContentObjectProjectsUpdated =
              cartContentObject.projects.filter((element) => {
                return element !== name;
              });
            cartContentObject.projects = cartContentObjectProjectsUpdated;
          }

          // Remove renders from cart
          if (cartContentObject) {
            let cartContentObjectRendersUpdated =
              cartContentObject.renders.filter((element) => {
                return element.projectName !== name;
              });
            cartContentObject.renders = cartContentObjectRendersUpdated;
          }

          // Check if cart is empty
          if (cartContentObject) {
            let cartContentStringUpdated = JSON.stringify(cartContentObject);
            localStorage.setItem("cartItems", cartContentStringUpdated);
          } else {
            // Cart is empty
            localStorage.removeItem("cartItems");
          }

          populateCart(cartItemContainer);
          setCartCounter(document.querySelector("#global--cart-icon-count"));

          // DELETE FIREBASE FILES
          // List all files in storage bucket and delete them
          storageRefParent.listAll().then((res) => {
            res.items.forEach((item) => {
              item.delete();
            });
          });
          storageRefModelFiles.listAll().then((res) => {
            res.items.forEach((item) => {
              item.delete();
            });
          });
          storageRefImages.listAll().then((res) => {
            res.items.forEach((item) => {
              item.delete();
            });
          });

          // Delete firestore project
          projectRef.delete();

          // Delete sample tracker
          sampleTrackerRef.delete();

          // Delete firestore renders
          projectRefRenders.get().then((docs) => {
            docs.forEach((doc) => {
              firebase
                .firestore()
                .collection("users")
                .doc(userId)
                .collection("renders")
                .doc(doc.id)
                .delete();
            });
          });
        });

        // Reset Button
        popupDelete.style.background = "var(--lightestGrey)";
        popupDelete.style.color = "var(--placeholder)";
        popupDelete.style.cursor = "default";

        // Remove from session Storage
        sessionStorage.removeItem("projectForDeletion");
      }
    } else {
      window.alert("You can not delete a project that has pending images.");
    }
  });
});

/*__________________________ Functions ___________________________*/

// Add listener to newly created project card
function projectClickListener(cardContainer, projectData) {
  cardContainer.addEventListener("click", () => {
    // Set active project
    sessionStorage.setItem(
      "project",
      cardContainer.querySelector(".dashboard--container-txt > h3").textContent
    );

    // Sample reroute
    if (cardContainer.classList.contains("sample")) {
      sessionStorage.setItem("sample", true);
      // Set session storage to quote
      sessionStorage.setItem("project--type", "project");
    } else {
      sessionStorage.setItem("sample", false);
      // Set session storage to quote
      sessionStorage.setItem("project--type", "project");
    }

    // Finalize reroute
    if (projectData.status === "Finalize Your Submission") {
      if (projectData.selfMade === true) {
        // Upload model
        sessionStorage.setItem("redirect", "model");
      } else {
        // Upload images
        sessionStorage.setItem("redirect", "images");
      }

      window.location.href = "create.html";
    }

    // Complete reroute
    if (projectData.status === "Completed") {
      // Project page
      window.location.href = "project.html";

      // Set session storage to project
      sessionStorage.setItem("project--type", "project");
    }

    // Quote reroute
    if (projectData.status === "Check quote") {
      // Set session storage to quote
      sessionStorage.setItem("project--type", "quote");

      // Project page
      window.location.href = "project.html";
    }
  });
}

// Build card container
//DEMO: function addProjectCard() {
//   if (window.location.href.includes("dashboard")) {
//     // Get projects container element
const projectsContainer = document.querySelector(".dashboard--projects");

//     // First clear all elements
//     let projectsArray = document.querySelectorAll(
//       ".dashboard--project-container"
//     );
//     projectsArray.forEach((child) => {
//       child.remove();
//     });

//     // Get data from firestore
//     firebase
//       .firestore()
//       .collection("users")
//       .doc("demo")//nonDEMO:userId
//       .collection("projects")
//       .get()
//       .then((querySnapshot) => {
//         // Set placeholder if no data exists
//         if (querySnapshot.empty) {
//           // Add placeholder
//           placeholder.style.display = "block";
//           // Remove 'add project button'
//           addProjectContainer.style.display = "none";

//           // Show sample card only
//         } else {
//           // Remove placeholder
//           placeholder.style.display = "none";

// Add project grid
//DEMO:const content = document.querySelector(".dashboard--projects");
/*DEMO:*/ const contentNew = document.querySelector(".dashboard--projects");
/*content*/ contentNew.style.display = "grid";

//DEMO:
let querySnapshot = [
  { status: "Completed", sample: true, submitDate: 1624025561870 },
];
//_____
querySnapshot.forEach((doc) => {
  let projectData = doc; //DEMO:.data();
  //DEMO:
  doc.id = "sample";
  console.log(projectData);
  //_____

  // Create Project Card Elements
  const cardContainer = document.createElement("div");
  const cardContainerImg = document.createElement("div");
  const cardDeleteButton = document.createElement("img");
  const cardContainerTxt = document.createElement("div");
  const cardStatus = document.createElement("h3");
  const cardSpinner = document.createElement("img");
  const cardProject = document.createElement("h3");
  const cardDate = document.createElement("p");
  const cardFlag = document.createElement("div");
  const cardFlagText = document.createElement("h3");

  // Get element references
  const addProjectE = document.querySelector("#dashboard--add-project");

  // Append elements
  projectsContainer.insertBefore(cardContainer, addProjectE);
  cardContainer.append(cardContainerImg);
  cardContainer.append(cardContainerTxt);

  // Delete Button
  if (
    (projectData.status !== "Quote pending" &&
      projectData.submitDate === null &&
      projectData.status !== "pending" &&
      projectData.status !== "Check quote") ||
    projectData.status === "Completed"
  ) {
    cardContainer.append(cardDeleteButton);
  }
  cardContainerImg.append(cardStatus);

  if (projectData.submitDate !== null && projectData.status !== "Completed") {
    cardContainerImg.append(cardSpinner);
  }
  if (
    projectData.status === "pending" ||
    projectData.status === "Quote pending"
  ) {
    cardContainerImg.append(cardSpinner);
  }
  cardContainerTxt.append(cardProject);
  cardContainerTxt.append(cardDate);

  // If sample
  if (projectData.sample == true) {
    cardContainer.append(cardFlag);
    cardFlag.append(cardFlagText);
  }

  let projectIdWithoutWhitespace = doc.id.replace(/\s/g, "-");

  // Set content and attributes
  if (projectData.sample === undefined) {
    cardContainer.setAttribute("class", "dashboard--project-container");
  }
  if (projectData.sample === true) {
    cardContainer.setAttribute("class", "dashboard--project-container sample");
  }
  cardContainer.setAttribute(
    "id",
    "dashboard--project-container-" + projectIdWithoutWhitespace
  );
  cardContainer.setAttribute("meta", doc.id);
  cardDeleteButton.setAttribute("class", "dashboard--container-delete");
  cardDeleteButton.setAttribute("src", "icons/delete.svg");
  cardContainerImg.setAttribute("class", "dashboard--container-img");
  cardFlag.setAttribute("class", "dashboard--container-flag");
  cardFlagText.textContent = " Try me";

  // Change to live images
  if (projectData.status === "Completed") {
    if (projectData.thumbnail !== undefined) {
      cardContainerImg.style["background-image"] =
        "url(" + projectData.thumbnail + ")";
    } else {
      if (projectData.sample === true) {
        cardContainerImg.style["background-image"] =
          "url('/images/scenes/ecom.jpg')";
      } else {
        console.log("haha");
        // Didn't exist... or some other error
        cardContainerImg.style["background-image"] =
          'url("/illustrations/placeholder-dashboard.png")';
        cardContainerImg.style["background-size"] = "cover";
      }
    }
  } else {
    cardContainerImg.style["background-color"] = "#FAFAFA";
  }

  // Show status until completion
  if (projectData.status !== "Completed") {
    cardStatus.innerHTML = projectData.status;
  }
  cardSpinner.setAttribute("src", "icons/spinner-thick.svg");
  cardSpinner.setAttribute("alt", "loading icon");
  cardContainerTxt.setAttribute("class", "dashboard--container-txt");
  cardDeleteButton.setAttribute("meta", doc.id);
  cardProject.innerHTML = doc.id;

  // Only show date submitted after submission
  if (projectData.submitDate !== null) {
    cardDate.innerHTML = moment(projectData.submitDate)
      .local()
      .format("MMMM Do - HH:mm");
  } else {
    cardDate.innerHTML = "Not yet submitted";
  }

  // Remove pointer on hover during wait time
  if (
    (projectData.submitDate !== null && projectData.status !== "Completed") ||
    projectData.status === "pending" ||
    projectData.status === "Quote pending"
  ) {
    cardContainer.style.cursor = "default";
    cardContainer.style["box-shadow"] = "0 0 0 2px var(--bg-light)";
    //cardContainer.style.background = '#FAFAFA'
  }

  openDeleteListener(cardDeleteButton);
  projectClickListener(cardContainer, projectData);
});
//DEMO:         }
//       });
//   }
// }

// Open delete listener
function openDeleteListener(cardDeleteButton) {
  // Listen for x click
  cardDeleteButton.addEventListener("click", (e) => {
    e.stopPropagation();

    projectForDeletion = cardDeleteButton.parentElement.querySelector(
      ".dashboard--container-txt > h3"
    ).textContent;

    setTimeout(function () {
      popupBG.style.opacity = "1";
      popup.style.opacity = "1";
      popup.style.transform = "translate(-50%, -50%)"; /*scale(1)*/
    }, 100);

    popupProjectName.innerHTML = projectForDeletion;
    popupBG.style.display = "block";
    popup.style.display = "block";

    popupInput.placeholder = projectForDeletion;

    // Reset button
    popupDelete.style.background = "var(--lightestGrey)";
    popupDelete.style.color = "var(--placeholder)";
    popupDelete.style.cursor = "default";

    // Save corresponding project reference
    sessionStorage.setItem(
      "projectForDeletion",
      cardDeleteButton.attributes.meta.value
    );
  });
}

// Check for project blocker
function checkProjectBlocker() {
  // Get project creation status reference
  blockerRef.get().then((docRef) => {
    let data = docRef.data();

    if (data.projectCreation === true) {
      projectCreation = true;
    } else {
      projectCreation = false;
    }
  });
}
