import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import CryptoJS from "crypto-js";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const secretKey = "hPPocvUzyNEqmDzxRtT2aTvRejl4+MN4u+5cS0auypk=";

export const hashData = (data:any) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

export const decryptData = (hash:any) => {
  try {
    const bytes = CryptoJS.AES.decrypt(hash, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Error al desencriptar o parsear los datos:", error);
    return null;
  }
};

export const saveToLocalStorage = (key:string, value:any) => {
  try {
    const hashedValue = hashData(value);
    localStorage.setItem(key, hashedValue);
  } catch (error) {
    console.error("Error al guardar en LocalStorage:", error);
  }
};

export const loadFromLocalStorage = (key:string) => {
  try {
    const hashedValue = localStorage.getItem(key);
    if (hashedValue) {
      return decryptData(hashedValue);
    }
    return null;
  } catch (error) {
    console.error("Error al cargar desde LocalStorage:", error);
    return null;
  }
};

export const clearLocalStorage = (key:string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error al limpiar LocalStorage:", error);
  }
};

export const clearAllLocalStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Error al limpiar todo LocalStorage:", error);
  }
};