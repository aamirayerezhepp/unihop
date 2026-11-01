/* Google accounts are on when the Firebase web config is set in .env.local (see .env.example),
   except in the Claude-artifact build: Claude pages cannot open Google's sign-in window. */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const googleEnabled = () => !!config.apiKey && import.meta.env.MODE !== 'artifact' && !window.claude;

/* Firebase is a separate chunk, downloaded only when Google accounts are on. */
export const loadCloud = () => import('./firebase.js').then(m => m.createCloud(config));
