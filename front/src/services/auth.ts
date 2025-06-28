import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../../firebase/firebase.config";
import firebase from "firebase/compat/app";

export const register = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    const { displayName, email, photoURL, uid } = result.user;
    const token = await result.user.getIdToken();
    return {
      displayName,
      email,
      photoURL,
      uid,
      token,
    };
  } catch (error: any) {
    const { code, message } = error;
    return {
      code,
      message,
    };
  }
};

export const logIn = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const result = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    const { displayName, email, photoURL, uid } = result.user;
    const token = await result.user.getIdToken();
    return {
      displayName,
      email,
      photoURL,
      uid,
      token,
    };
  } catch (error: any) {
    const { code, message } = error;
    return {
      code,
      message,
    };
  }
};
export const logInwithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const { displayName, email, photoURL, uid } = result.user;
    const token = await result.user.getIdToken();
    return {
      displayName,
      email,
      photoURL,
      uid,
      token,
    };
  } catch (error: any) {
    const { code, message } = error;
    return {
      code,
      message,
    };
  }
};
export const logOut = async () => {
  try {
    await auth.signOut();
  } catch (error: any) {
    const { code, message } = error;
    return {
      code,
      message,
    };
  }
};
