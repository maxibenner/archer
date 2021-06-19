/*__________________________ Elements ___________________________*/
const cardContainer = document.querySelector(".cards");
const cartCounter = document.querySelector("#global--cart-icon-count");
const cartItemContainer = document.querySelector(
  "#global-cart-body-container-items"
);
const displayProject = document.getElementById("display-project");
const projectDropdown = document.getElementById("dropdown-project");
const optionsDropdown = document.getElementById("dropdown-options");
const iconDropdown = document.getElementById("dropdown-icon");
const cardButtons = document.querySelectorAll(".scenes--button");

/*__________________________ References ___________________________*/
//DEMO:const scenesRef = firebase.firestore().collection("scenes");

/*__________________________ Variables ___________________________*/
let scenesArrayLength = null;

/*__________________________ Init ___________________________*/
setCartCounter(cartCounter);
populateCart(cartItemContainer);

/*____________________ Track Auth State ______________________*/
//DEMO:: firebase.auth().onAuthStateChanged(function (user) {
//   if (user) {
//     // Init
//     getCompletedProjectsOfUser(user.uid);
//   }
// });

//DEMO
getCompletedProjectsOfUser("demo");
//_____

/*__________________________ Listeners ___________________________*/

// Dropdown hover effect
projectDropdown.addEventListener("mouseover", () => {
  projectDropdown.style.opacity = 0.7;
});
projectDropdown.addEventListener("mouseout", () => {
  projectDropdown.style.opacity = 1;
});

// Listen for dropdown click
projectDropdown.addEventListener("click", () => {
  if (optionsDropdown.style.display === "none") {
    optionsDropdown.style.display = "block";
    iconDropdown.style.transform = "rotate(180deg)";
  } else {
    optionsDropdown.style.display = "none";
    iconDropdown.style.transform = "rotate(0deg)";
  }
});

// Listen for card button clicks
cardButtons.forEach((button) => {
  button.addEventListener("click", () => {
    let scene = button.getAttribute("meta");

    sessionStorage.setItem("scene", scene);
    sessionStorage.setItem("project", displayProject.textContent);

    if (displayProject.getAttribute("meta") === "sample") {
      sessionStorage.setItem("sample", true);
    } else {
      sessionStorage.setItem("sample", false);
    }

    switch (scene) {
      case "ecom":
        window.location.href = "./studio/ecom.html";
        break;

      case "ecom-leaves":
        window.location.href = "./studio/ecom-leaves.html";
        break;

      case "ecom-cloud_walker":
        window.location.href = "./studio/ecom-cloud_walker.html";
        break;

      default:
        window.location.href = "./customize.html";
    }
  });
});

// FUNCTIONS -----------------------------------

// Get all completed projects
function getCompletedProjectsOfUser(userId) {
  // Pre added objects to local array
  let projectArray = [{ name: "sample", sample: true }];
  // DEMO:
  insertProjectsIntoDropdown(optionsDropdown, projectArray);
  //_____

  // Get data from firestore
  //DEMO: firebase
  //   .firestore()
  //   .collection("users")
  //   .doc(userId)
  //   .collection("projects")
  //   .where("status", "==", "Completed")
  //   .get()
  //   .then((docs) => {
  //     docs.forEach((doc) => {
  //       let projectName = doc.id;
  //       let sample;
  //       // Get sample state
  //       if (doc.data().sample !== undefined) {
  //         sample = true;
  //       } else {
  //         sample = false;
  //       }

  //       projectArray.push({ name: projectName, sample: sample });
  //     });

  //     insertProjectsIntoDropdown(optionsDropdown, projectArray);
  //   });
}

// Insert Projects Into Dropdown
function insertProjectsIntoDropdown(container, projects) {
  projects.forEach((project) => {

    let newP = document.createElement("p");
    newP.textContent = project.name;
    container.append(newP);

    newP.addEventListener("click", () => {
      displayProject.textContent = project.name;

      // Set sample state
      if (project.sample === true) {
        displayProject.setAttribute("meta", "sample");
      } else {
        displayProject.setAttribute("meta", "nosample");
      }
      container.style.display = "none";
      iconDropdown.style.transform = "rotate(0deg)";

      // Add buttons to project cards
      cardButtons.forEach((button) => {
        button.style.display = "block";
      });
    });
  });

  checkPushDelete(projects);
}

// Check for pushDelete
function checkPushDelete(projects) {
  //console.log(projects)

  let pushValue = sessionStorage.getItem("pushDelete");

  if (pushValue) {
    displayProject.textContent = pushValue;
    console.log(pushValue)
    console.log(projects[0].name)

    // Filter projects for project name
    let onlyProjectArray = projects.filter(
      (project) => project.name == pushValue
    );

    // Check if project is sample project and set meta
    if (onlyProjectArray[0].sample == true) {
      displayProject.setAttribute("meta", "sample");
    } else {
      displayProject.setAttribute("meta", "nosample");
    }

    // Show buttons when redirected from project
    cardButtons.forEach((button) => {
      button.style.display = "block";
    });

    // Check for sample

    sessionStorage.removeItem("pushDelete");
  }
}
