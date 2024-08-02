//Importing Emvironment Variables
const firebaseKeys = {
  apiKey: String(import.meta.env.VITE_API),
  authDomain: String(import.meta.env.VITE_AUTH_DOMAIN),
  projectId: String(import.meta.env.VITE_PROJECT_ID),
  storageBucket: String(import.meta.env.VITE_STORAGE_BUCKET),
  VITE_MESSANGING_SENDER_ID: String(import.meta.env.VITE_MESSANGING_SENDER_ID),
  VITE_APP_ID: String(import.meta.env.VITE_APP_ID),
};
export default firebaseKeys;
