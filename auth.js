import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
// Persiste sessão entre reloads
await setPersistence(auth, browserLocalPersistence);

/**
 * Faz login com Google usando popup.
 * @returns {Promise<import('firebase/auth').UserCredential|void>} UserCredential ou undefined se erro
 */
export async function loginWithGoogle() {
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    alert('Erro ao fazer login: ' + (error.message || error));
  }
}

/**
 * Faz logout do usuário autenticado.
 */
export function logout() {
  signOut(auth);
}

// Listener de autenticação
onAuthStateChanged(auth, user => {
  const loginContainer = document.getElementById('login-container');

  if (user) {
    if (loginContainer) loginContainer.style.display = 'none';
    console.log("Usuário logado:", user);
    
    if (typeof loadData === 'function') loadData();
  } else {
    if (loginContainer) loginContainer.style.display = '';
  }
});

export { auth };
