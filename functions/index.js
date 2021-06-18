const admin = require("firebase-admin");
const functions = require("firebase-functions");
admin.initializeApp();

const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.new_user_setup = functions.auth.user().onCreate((user) => {
  db.collection("users")
    .doc(user.uid)
    .collection("projects")
    .doc("sample")
    .set({ status: "Completed", submitDate: Date.now(), sample: true });
});
