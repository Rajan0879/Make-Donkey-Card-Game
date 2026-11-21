import admin from 'firebase-admin';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let firebaseApp = null;
let firestoreDb = null;
let authAdmin = null;

const hasValidCredentials = 
  config.firebase.projectId && 
  config.firebase.clientEmail && 
  config.firebase.privateKey;

if (hasValidCredentials) {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey
      })
    });
    firestoreDb = admin.firestore();
    authAdmin = admin.auth();
    logger.info('Firebase Admin successfully initialized.');
  } catch (err) {
    logger.warn({ err }, 'Firebase Admin initialization failed; operating in local mode.');
  }
} else {
  logger.info('Firebase credentials not detected. Operating with in-memory persistence and dev auth.');
}

export { firebaseApp, firestoreDb, authAdmin };
