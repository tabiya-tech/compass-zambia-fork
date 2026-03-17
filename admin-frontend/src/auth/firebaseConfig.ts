import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { getFirebaseAPIKey, getFirebaseDomain, getFirebaseProjectId, getFirebaseTenantId } from "src/envService";

// Get the firebase config from the environment variables
const firebaseConfig = {
  apiKey: getFirebaseAPIKey(),
  authDomain: getFirebaseDomain(),
  projectId: getFirebaseProjectId(),
};

// Initialize the firebase app if it hasn't been initialized yet
firebase.initializeApp(firebaseConfig);

const firebaseAuth = firebase.auth();

// Set the tenant ID for multi-tenant authentication
const tenantId = getFirebaseTenantId();
if (tenantId) {
  firebaseAuth.tenantId = tenantId;
}

const firebaseFirestore = firebase.firestore();

export { firebaseAuth, firebaseFirestore };
