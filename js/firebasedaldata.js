import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  // ...your firebaseConfig here...

  apiKey: "AIzaSyA8O3vdwkA_6mNzSLqvpeDl0FM_wqyV8fk",
  authDomain: "caltracker-845a7.firebaseapp.com",
  databaseURL: "https://caltracker-845a7-default-rtdb.firebaseio.com",
  projectId: "caltracker-845a7",
  storageBucket: "caltracker-845a7.firebasestorage.app",
  messagingSenderId: "917829840978",
  appId: "1:917829840978:web:64ebc625e5e82ca8432f8b",
  measurementId: "G-YHKQDG12S7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "nam5"); // Specify nam5 location

const dalDataCollection = collection(db, "dal_data");

export async function addEquipment(equipment) {
  return await addDoc(dalDataCollection, equipment);
}

export async function getEquipments() {
  const snapshot = await getDocs(dalDataCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateEquipment(id, data) {
  const equipmentRef = doc(db, "dal_data", id);
  return await updateDoc(equipmentRef, data);
}

export async function deleteEquipment(id) {
  const equipmentRef = doc(db, "dal_data", id);
  return await deleteDoc(equipmentRef);
}
