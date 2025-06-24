import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";

// קריאה של כל התיקים
export async function getPatients() {
  const querySnapshot = await getDocs(collection(db, "patients"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// הוספת תיק חדש
export async function addPatient(patient) {
  await addDoc(collection(db, "patients"), patient);
}

// עדכון תיק
export async function updatePatient(id, data) {
  await updateDoc(doc(db, "patients", id), data);
}

// מחיקת תיק
export async function deletePatient(id) {
  await deleteDoc(doc(db, "patients", id));
}

// --- סטטוס משימות שוטפות גלובלי ---

// קריאה של סטטוס משימות שוטפות גלובלי
export async function getRoutineStatus() {
  const docSnap = await getDocs(collection(db, "routineStatus"));
  if (!docSnap.empty) {
    // נחזיר את המסמך הראשון (בהנחה שיש רק אחד גלובלי)
    return { id: docSnap.docs[0].id, ...docSnap.docs[0].data() };
  }
  return null;
}

// עדכון סטטוס משימות שוטפות גלובלי
export async function setRoutineStatus(statusArr) {
  // נשמור תמיד במסמך בשם 'global'
  await setDoc(doc(db, "routineStatus", "global"), { routineChecked: statusArr });
}

export async function getAppData() {
  const docRef = doc(db, "workflow", "main");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error("המסמך workflow/main לא קיים ב-Firestore");
  }
}

export async function setAppData(data) {
  await setDoc(doc(db, "workflow", "main"), data);
} 