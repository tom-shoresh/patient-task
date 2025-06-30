import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";

// קריאה של כל התיקים
export async function getPatients() {
  console.log('📥 getPatients called');
  try {
    const querySnapshot = await getDocs(collection(db, "patients"));
    const patients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('✅ getPatients completed, found', patients.length, 'patients');
    console.log('📋 Patients data:', patients);
    return patients;
  } catch (error) {
    console.error('❌ getPatients failed:', error);
    throw error;
  }
}

// הוספת תיק חדש
export async function addPatient(patient) {
  await addDoc(collection(db, "patients"), patient);
}

// עדכון תיק
export async function updatePatient(id, data) {
  console.log('🔥 updatePatient called with:', { id, data });
  try {
    await updateDoc(doc(db, "patients", id), data);
    console.log('✅ updatePatient completed successfully');
  } catch (error) {
    console.error('❌ updatePatient failed:', error);
    throw error;
  }
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
  console.log('🔥 getAppData called');
  try {
    const docRef = doc(db, "workflow", "main");
    console.log('📄 Getting document from workflow/main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let data = docSnap.data();
      // מיגרציה אוטומטית: אם יש decisionTree בודד ואין decisionTrees, נעטוף אותו כאובייקט
      if (data.decisionTree && !data.decisionTrees) {
        data.decisionTrees = { "default": data.decisionTree };
        // אפשר למחוק את data.decisionTree אם רוצים להפסיק תמיכה לאחור
        delete data.decisionTree;
      }
      console.log('✅ getAppData completed successfully:', data);
      return data;
    } else {
      console.error('❌ Document workflow/main does not exist');
      throw new Error("המסמך workflow/main לא קיים ב-Firestore");
    }
  } catch (error) {
    console.error('❌ getAppData failed:', error);
    throw error;
  }
}

export async function setAppData(data) {
  // מחיקת decisionTree לפני שמירה
  if (data.decisionTree) {
    delete data.decisionTree;
  }
  // שמירה: תמיד נשמור decisionTrees כאובייקט
  await setDoc(doc(db, "workflow", "main"), data);
} 