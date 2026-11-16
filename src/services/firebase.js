import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

// Firebase web configuration is public by design: it ships in the browser bundle.
// Access is constrained by the Realtime Database rules and by API-key restrictions
// configured in the Google Cloud console, not by hiding this object.
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'databaseURL', 'appId'];

// The emulator is opt-in: it is only used when the emulator host variables are
// set. Production builds leave them unset and talk to the real project.
const AUTH_EMULATOR_HOST = process.env.REACT_APP_FIREBASE_AUTH_EMULATOR_HOST;
const DATABASE_EMULATOR_HOST = process.env.REACT_APP_FIREBASE_DATABASE_EMULATOR_HOST;

// A missing key must degrade the app, not crash it at import time.
export const isFirebaseConfigured = REQUIRED_KEYS.every(key => Boolean(firebaseConfig[key]));

let firebaseApp = null;
let auth = null;
let database = null;

if (isFirebaseConfigured) {
    try {
        firebaseApp = initializeApp(firebaseConfig);
        auth = getAuth(firebaseApp);
        database = getDatabase(firebaseApp);

        if (AUTH_EMULATOR_HOST) {
            connectAuthEmulator(auth, `http://${AUTH_EMULATOR_HOST}`, { disableWarnings: true });
        }

        if (DATABASE_EMULATOR_HOST) {
            const [databaseHost, databasePort] = DATABASE_EMULATOR_HOST.split(':');
            connectDatabaseEmulator(database, databaseHost, Number(databasePort));
        }
    } catch (error) {
        // An invalid key or malformed config leaves the app in offline mode.
        firebaseApp = null;
        auth = null;
        database = null;
    }
}

export { auth, database };
