import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import DynamicQuestions from "./DynamicQuestions";
import CircleProgress from "./CircleProgress";
import DecisionTreeEditor from "./DecisionTreeEditor";
import RoutineTasksEditor from "./RoutineTasksEditor";
import MainTasksEditor from "./MainTasksEditor";
import RichTextEditor from "./RichTextEditor";
import { FaArchive } from 'react-icons/fa';
import { FaHome } from 'react-icons/fa';
import { FaCog } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa';
import PatientsListPanel from "./PatientsListPanel";
import { getAppData, setAppData as setAppDataFirestore, getPatients, addPatient, updatePatient, deletePatient as deletePatientFromApi, getRoutineStatus, setRoutineStatus, getRoutineNotes, setRoutineNotes, getPotentialReferralNotes, setPotentialReferralNotes } from "./firebaseApi";
import mermaidLogo from "./assets/mermaid_logo.png.png";
import { subscribeToPatients } from "./firebaseApi";
import { subscribeToRoutineStatus, subscribeToRoutineNotes, subscribeToPotentialReferralNotes } from "./firebaseApi";

// משפטים אקראיים לתצוגה כאשר אין תיק נבחר
const idleQuotes = [
  "כל העם צבא, כל הארץ חזית. ~ דוד בן-גוריון",
  "זרועו המרתיעה והמוחצת של צבא־הגנה לישראל היא היא ערובתנו לשלום. ~ לוי אשכול",
  "שום חוזים והסכמים לא יגנו עלינו אם לא יעמדו מאחוריהם חוסן צבאי וכוחות־קרב ישראליים מאומנים ומהימנים, ומחסן־נשק עצום, ומלאי רב של יוזמה טכנית, וכושר־האַמצאה. ~ ישראל כהן, 1949",
  "אם המפקדים יעוררו את האמון, את הדבקות ואת האהבה בחיילים שלהם - אזי תדע כל אם עבריה כי הפקידה את גורל בניה בידי המפקדים הראויים לכך. ~ דוד בן גוריון בכנס סגל פיקוד כללי, הקריה, 2 ביולי 1963",
  "האדם הוא מקור עוצמתו של צה\"ל. זה הרואה בשרות הצבאי ערך וזכות ולא רק חובה חוקית. ~ דני חלוץ",
  "אין ספק שמכל האתגרים שבצבא, האתגר האנושי הוא הגדול מכולם. ~ תא\"ל איתיאל דגני בשיחה עם פקודיו",
  "באופן אירוני ואפילו טרגי דווקא הצבא מעניק משמעות מיוחדת לאזרחות הישראלית. והוא מקנה לישראלים צעירים תחושה של בגרות ואחריות שאינה שכיחה במערב. הוא מלמד אותם לעבוד בצוותים, להתמודד עם אתגרים ולבצע את מה שנראה כבלתי אפשרי. ~ ארי שביט, 'בית שלישי'",
  "או סיירת, או ניירת.",
  "אל תחפש היגיון בשיגעון!",
  "יום יבוא והשמש תזרח ואני אהיה אזרח.",
  "יום בצבא זה כמו קפה, או שהוא שחור או שזה נס.",
  "אכלו לי, שתו לי, היה לי ערפל בקיטבג. ",
  "שמתי את הנשק על הריוֹ והריו נסע. ",
  "אם לא תלמד, תהיה נגד, אם תלשין, תהיה קצין.",
  "ננוח ביום כדי שנוכל לישון בלילה.",
  "כשנולדתי בכיתי, כשהתגייסתי הבנתי למה.",
  "עוד יום, עוד 10 אגורות.",
  "הפשרה של היום היא הנורמה של מחר.",
  "ההון האנושי הוא הנשק האמיתי של צה\"ל.",
  "פעם אחת - מקרה. פעם שנייה - תופעה. פעם שלישית - סטטיסטיקה. פעם רביעית - מגיפה.",
  "הוראות אלו נכתבו בדם.",
  "חבית של זיעה שווה טיפה של דם.",
  "זה מה שיש, ועם זה ננצח.",
  "אין לא יכול, יש לא רוצה.",
  "קרבי זה הכי אחי.",
  "אזרחי זה הכי הכי. ~ פרפרזה",
  "כי בתחבולות, תעשה-לך מלחמה (מקור: משלי פרק כ\"ד פסוק ו)",
  "קצין פנתר - קצין מאלתר",
  "קשה יש רק בלחם, וגם אותו אוכלים.",
  "קשה יש רק בלחם, וגם אותו אמא מוציאה לי.",
  "קשה יש רק בלחם, וגם מזה יש לי פטור.",
  "קשה יש רק בבוקר, וגם זה עובר.",
  "קשה באימונים - קל בקרב.",
  "קשה באימונים - יפה בים.",
  "קפה באימונים- נס בקרב.",
  "קשה באימונים - אין קרב.",
  "כבד יש רק באווזי.",
  "כבד יש רק בפיתה.",
  "נוח היה רק בתיבה.",
  "חם זה רק אח של יפת.",
  "קר זה רק אוטו.",
  "קפוא זה שחקן כדורגל.",
  "ציפיות יש רק בכרית.",
  "הכאב הוא רגעי אך הגאווה היא נצחית.",
  "הכאב הוא רגעי אך הפריצת דיסק נצחית.",
  "צדק זה רק כוכב.",
  "שלילי יש רק בתעודה.",
  "'אמור' זה שם של דג, וגם רומא מהסוף להתחלה.",
  "אמור זה שם של דג והוא לא שוחה לא בנח\"ל ולא בצנחנים.",
  "עגלות יש רק בסופר, וגם אותן סוחבים.",
  "אומרים שהכל בראש. אז למה כואבות לי הרגליים??",
  "חול זה טעים, קוצים זה נעים, קשה יש רק בלחם וגם אותו אוכלים.",
  "חייל, שפר הופעתך!",
  "המחנה הוא ביתך, שמור על ניקיונו.",
  "צבוע זה חדש; רטוב זה נקי; מערום זה מסודר; בורקס זה חגיגי.",
  "אם זה זז - הצדע לו. אם זה לא זז - הרם אותו. אם אתה לא יכול להרים אותו - סייד אותו בלבן.",
  "המפקד אינו שוכח שמות - פשוט לכל החיילים קוראים שאול.",
  "המפקד אינו מאחר - הוא רק מתעכב או שכולם הקדימו.",
  "המפקד אינו מפליץ - הוא רק מפיץ את רוח צה\"ל.",
  "המפקד לא נפל - הוא רק בדק מקרוב את השטח.",
  "מפקד טוב, זה מפקד שחייליו ילכו איתו לקרב יחפים.",
  "השטח הוא הבית, הבסיס בית מלון והבית הוא חלום",
  "אני סמכתי עליכם ואתם תקעתם סכין בגבי (נקרא בקול נמוך ומאיים)",
  "מפקד שאינו מורה ומחנך, איננו מפקד כלל.",
  "אש אש אש, אש אש אש, והנשק לא יורה! מה עושים? מה עושים? מתפעלים.",
  "חייל, תעלה שחור על שחור ועוף לפינת הדגל.",
  "לחופש אין מחיר, אבל יש לו תאריך.",
  "הפקידה שתרשום את השחרור שלך עכשיו בטיול שנתי בי\"א.",
  "הפקידה שתרשום את השחרור של הטייס עכשיו בכיתה א'.",
  "מהפחית שאני זרקתי בבקו\"ם עשו את הדיסקית שלך.",
  "הנצח לא נמדד בזמן אבל הפז\"ם כן!",
  "עוד לא נולד המניאק שיעצור את הזמן. (אבל נולד זה שיכול להאריך אותו.)",
  "עוד לא שתלו את העץ, שממנו יעשו את הנייר, שעליו יכתבו את תעודת השחרור שלך.",
  "צעד קטן לקב\"ן - צעד גדול לאזרחות",
  "יום שחרורי קרב ובא, ליבי מלא געגועים, אל הבקו\"ם אני בא וסלאמת לצעירים.",
  "לכל שבת יש מוצאי שבת.",
  "פין פציל אבד? הנה אבדה עוד שבת.",
  "תריס פתוח - שבת בטוח.",
  "קליפס פתוח, שבת בטוח",
  "קת סגורה, שבת סגורה.",
  "לכל בעיה יש פיתרון - שבת.",
  "בתחבולות תעשה לך מלחמה (משלי כ\"ד, ו') ~ יחידת דובדבן",
  "ארדוף אויבי ואשיגם ולא אשוב עד כלותם. ~ יחידת אגוז",
  "יחידת סגולה. ~ חטיבת גבעתי",
  "הנדסה קרבית - ראשונים תמיד. ~ חיל ההנדסה",
  "תמיד ראשונים. ~ חיל ההנדסה",
  "המטרה - הצלת חיים ~ חטיבת החילוץ וההצלה, פיקוד העורף",
  "היתרון האנושי. ~ חטיבת הנח\"ל",
  "חדות, זריזות וחתירה למגע. ~ חטיבת הנח\"ל",
  "הצופה לפני המחנה. ~ חיל מודיעין השדה",
  "המעז מנצח. ~ סיירת מטכ\"ל",
  "ניזום, נוביל, נהווה דוגמא וננצח. ~ חטיבת הצנחנים",
  "בלי סיוע, החי\"ר (חיל הרגלים) לא ינוע. ~ חיל התותחנים",
  "את הקשה נעשה היום, את הבלתי אפשרי מחר. ~ חיל ההנדסה",
  "לך, דומייה, תהילה. (ע\"פ תהלים ס\"ה) ~ אגף המודיעין",
  "הדרום מרגיש בטוח ~ חטמ\"ר הערבה, חטמ\"ר שגיא",
  "כשאתה רואה צלף, אל תרוץ - כי תמות עייף.",
  "אני חובש, משמע אתה קיים.",
  "הנדסה קרבית: הכומתה - כסף, הלב - זהב, הרגליים - פלטינה.",
  "פעם תותחן – תמיד תותחן.",
  "פעם תותחן - תמיד נטחן.",
  "תותחנים – תחכום ועוצמה. ~ חיל התותחנים",
  "כסף זה הצבע, פומה זה הכלי.",
  "כסף זה בקבע, פומה זה הכלי",
  "עצמה לוגיסטית מהמטכ\"ל ועד לחייל. ~ אגף הטכנולוגיה והלוגיסטיקה",
  "נחשון - משפחה נחושת נצחון.",
  "נחשון - תמיד ראשון.",
  "כשהגלים מתחזקים, אותנו זה לא מעניין ~ שייטת 7",
  "פוגעים בחוט השערה לא מחטיאים ~ עוצבת קלע דוד",
  "אין מקום רחוק מדי, אין משימה קשה מדי ~ גדוד קשר 533.",
  "את הקשה אנו מבצעים מיד, הבלתי אפשרי לוקח מעט יותר - מוטו של טייסת 69",
  "ראשונים בארץ לא נודעת ~ מרכז ניסויי טיסה (טייסת מנ\"ט)",
  "אנחנו לא מרביצים אנחנו מ\"כים ~ במערך מגל",
  "זן נדיר, ציפור משונה. ~ יחידת שלדג",
  "בצרה קראת ואחלצך ~ יחידת 669",
  "בקול דממה בוטחת עם רדת ליל יטרוף מגלן האש את טרפו. ~ יחידת מגלן",
  "מה שלא רואים ממטר - מריחים מקילומטר. ~ יחידת עוקץ",
  "אם לרגשות היו צבעים, הגאווה הייתה מנומרת. ~ חטיבת כפיר",
  "אי אפשר לברוח ממה שלא רואים. ~ בלשי המשטרה הצבאית",
  "זה לא גודל השריר, זה עומק השריטה. ~ קורס בילוש משטרה צבאית",
  "כומתה שחורה - חיים שחורים",
  "בחורים זהב כומתה כסף רגליים מפלטינה. ~ הנדסה קרבית",
  "רחוק מהעין בתוך הלב. ~ צלפים",
  "החיים ג'ונגל אחד גדול, אצלנו כל אחד אריה. ~ מיתר",
  "אמרו שלעץ יש חיים אנחנו ניתן לו את הנשמה. ~ חטיבת גולני",
  "כעטלף המגיח בעלטה, כלהב המבתר בדומיה, כרימון המנפץ ברעם. ~ שייטת 13",
  "הדברים הגדולים, נעשים בחשאי. ~ טייסת 118, 'דורסי הלילה'",
  "במקום בו יעצרו הזחלים - שם יקבע הגבול ~ חיל השריון",
  "הזחלים יעצרו איפה שהפלסים יתעייפו",
  "וארדוף מפכיסי ואשיגם ולא אשוב עד כלותם.",
  "האדם שבטנק ינצח.",
  "האדם שבטנק ינצח, אך הטנק המתקדם בעולם לא יזיק.",
  "קורס טייס - באנו בשביל לעוף.",
  "פעם תותחן - מספיק.",
  "היגיון לא חודר שיריון.",
  "מי שהולך לחי\"ר משלם את המחיר.",
  "בחי\"ר בחרת? בחרת בחרטא.",
  "כשהחלום נגוז, אגוז.",
  "גולני שלי, אבל לא בשבילי.",
  "מי שחלם גבעתי, קם באוהל.",
  "האדם שבטנק יתקלח. ",
  "האדם שבמגח יתקלח.",
  "כשאלוהים ברא את אדם וחווה, הוא נתן להם עלים להסתיר את הבושה, לגולני הוא נתן עץ שלם, ולמודיעין – שדה.",
  "נח\"ל - נתקלנו? חכו לגולני",
  "שריון - שבת ראשונה יוצאים, והשאר נשארים.",
  "אחרי לצנחנים, איתי לגבעתי, ראשון להנדסה-במקומי לתותחנים.",
  "א' - זה אוהל, ב' - זה בית, ג' - זה מה שמפריד ביניהם.",
  "צעד קטן לקב\"ן, צעד גדול לאזרחות.",
  "פעם טייס, כמעט חובל, תמיד תותחן.",
  "אם אני לא טס, אף אחד לא טס. ~ מערך הנ\"מ ",
  "אם היה לנו 'רעל', היינו שותים אותו.",
  "צנחנים חושבים ורק אחר־כך יורים; גולני יורים ורק אחר־כך חושבים; גבעתי חושבים שהם יורים; והנח\"ל? הנח\"ל זאת אחלה להקה.",
  "חובשים – הטעויות שלנו, החיים שלכם.",
  "הנדסה קרבית – שמאל, שמאל, שמאל, ימין מי שיכול.",
  "הבא להשכימך, השכם להרגו.",
  "טוב מראה עיניים משמונה מאתיים (8200).",
  "הטובים לטיס, הטובות לטייסים; הטובים לרפת והטובות לרפתנים ~ חיל האוויר; רפת קיבוץ דפנה",
  "שנהיה לראש ולא למגלן ~ יחידת אגוז.",
  "קשה באימונים ואין קרב ~ על מערך מגל",
  "מתנ\"מ - מרכז, תענוגות, נופש ומין.",
  "פעם תותחן? תמיד נטחן! פעם טען? תמיד נטחן! פעם נהג? תמיד נטחן!",
  "קריה - קמתי, ראיתי, יאללה הביתה.",
  "חי\"רניק טועה - חי\"רניק מת. תותחן טועה - חי\"רניק מת. טייס טועה - בחורה מתפנה.",
  "מלש\"ב (מועמד לשירות ביטחון) טועה - תותחן.",
  "שייטת 13 זה גולנצ'יקים שיודעים לשחות. ~ סא\"ל גיורא לוי, מפקד סיירת מטכ\"ל"
];

// פונקציה לטעינת נתונים מ-Firestore (במקום מ-GitHub)
const fetchAppData = async () => {
  console.log('🔄 fetchAppData started');
  try {
    console.log('📥 Calling getAppData...');
    const data = await getAppData();
    console.log('✅ getAppData returned:', data);
    return data;
  } catch (err) {
    console.error('❌ Error in fetchAppData:', err);
    throw new Error("שגיאה בטעינת נתוני workflow/main מ-Firestore: " + err.message);
  }
};

export default function App() {
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [patient, setPatient] = useState(null);
  const [patientsList, setPatientsList] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [taskSubtasks, setTaskSubtasks] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [form, setForm] = useState({ identifier: "" });
  const [showDynamicQuestions, setShowDynamicQuestions] = useState(false);
  const [centerTab, setCenterTab] = useState('add'); // 'add' או 'manage'
  const [archivedPatients, setArchivedPatients] = useState([]);
  const [archiveOpen, setArchiveOpen] = useState(true);
  const [menuOpenIdx, setMenuOpenIdx] = useState(null);
  const [search, setSearch] = useState("");
  const [rightPanelWidth, setRightPanelWidth] = useState(260); // px
  const [leftPanelWidth, setLeftPanelWidth] = useState(260); // px
  const [dragging, setDragging] = useState(null); // 'right' | 'left' | null
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBackstageView, setShowBackstageView] = useState(false);
  const menuRef = useRef(null);
  const [idleQuoteIdx, setIdleQuoteIdx] = useState(() => Math.floor(Math.random() * idleQuotes.length));
  
  // מצב לטעינת נתונים
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // --- סטייט להערות חופשיות ---
  const [notes, setNotes] = useState("");

  // --- סטייט לעריכת שם התיק ---
  const [editingPatientName, setEditingPatientName] = useState(false);
  const [editingPatientNameValue, setEditingPatientNameValue] = useState("");

  // --- סטייט למשימות שוטפות ---
  const [routineChecked, setRoutineChecked] = useState([]);

  // --- טען סטטוס משימות שוטפות גלובלי מ-Firestore ---
  useEffect(() => {
    const unsubscribe = subscribeToRoutineStatus((status, error) => {
      if (error) return;
      if (status && Array.isArray(status.routineChecked)) {
        setRoutineChecked(status.routineChecked);
      } else if (appData) {
        setRoutineChecked(Array(appData.routineTasks.length).fill(false));
      }
    });
    return () => unsubscribe();
  }, [appData]);

  // --- עדכן סטטוס משימות שוטפות גלובלי ב-Firestore בכל שינוי ---
  useEffect(() => {
    if (routineChecked.length > 0) {
      setRoutineStatus(routineChecked);
    }
  }, [routineChecked]);

  // --- פונקציה לעדכון סטטוס משימה שוטפת ---
  const handleRoutineCheck = (idx) => {
    setRoutineChecked(checked => {
      const updated = [...checked];
      updated[idx] = !updated[idx];
      return updated;
    });
  };

  // פונקציות עריכה למשימות
  const updateMainTask = (taskIndex, updatedTask) => {
    if (!appData) return;
    let newData;
    if (taskIndex === -1 && Array.isArray(updatedTask)) {
      newData = { ...appData, mainTasks: updatedTask };
    } else {
      newData = {
        ...appData,
        mainTasks: appData.mainTasks.map((task, index) => 
          index === taskIndex ? updatedTask : task
        )
      };
    }
    setAppData(newData);
    setAppDataFirestore(newData);
  };

  const addMainTask = (newTask) => {
    if (!appData) return;
    const newData = {
      ...appData,
      mainTasks: [...appData.mainTasks, newTask]
    };
    setAppData(newData);
    setAppDataFirestore(newData);
  };

  const deleteMainTask = (taskIndex) => {
    if (!appData) return;
    const newData = {
      ...appData,
      mainTasks: appData.mainTasks.filter((_, index) => index !== taskIndex)
    };
    setAppData(newData);
    setAppDataFirestore(newData);
  };

  // פונקציות עריכה למשימות שוטפות
  const updateRoutineTask = (taskIndex, newTask) => {
    if (!appData) return;
    let newData;
    if (taskIndex === -1 && Array.isArray(newTask)) {
      newData = { ...appData, routineTasks: newTask };
    } else {
      newData = {
        ...appData,
        routineTasks: appData.routineTasks.map((task, index) => 
          index === taskIndex ? newTask : task
        )
      };
    }
    setAppData(newData);
    setAppDataFirestore(newData);
  };

  const addRoutineTask = (newTask) => {
    if (!appData) return;
    const newData = {
      ...appData,
      routineTasks: [...appData.routineTasks, newTask]
    };
    setAppData(newData);
    setAppDataFirestore(newData);
  };

  const deleteRoutineTask = (taskIndex) => {
    if (!appData) return;
    const newData = {
      ...appData,
      routineTasks: appData.routineTasks.filter((_, index) => index !== taskIndex)
    };
    setAppData(newData);
    setAppDataFirestore(newData);
  };

  // שימוש ב-decisionTrees כאובייקט
  // נבחר עץ ברירת מחדל ("default") אם אין בחירה
  const getCurrentDecisionTree = () => {
    if (appData?.decisionTrees && selectedTreeId && appData.decisionTrees[selectedTreeId]) {
      return appData.decisionTrees[selectedTreeId];
    }
    return null;
  };

  // עזר: בדיקה האם selectedTreeId קיים
  const isValidSelectedTreeId = appData?.decisionTrees && selectedTreeId && appData.decisionTrees[selectedTreeId];

  const updateDecisionTree = (updatedTree) => {
    console.log('🔄 updateDecisionTree called with:', updatedTree);
    if (!appData || !isValidSelectedTreeId) {
      console.log('❌ updateDecisionTree: appData או isValidSelectedTreeId לא תקינים');
      return;
    }
    let newData = { ...appData };
    newData.decisionTrees = { ...appData.decisionTrees, [selectedTreeId]: updatedTree };
    console.log('📤 updateDecisionTree: מעדכן appData ו-Firestore עם:', newData);
    setAppData(newData);
    setAppDataFirestore(newData);
  };

  // טעינת נתונים מ-Firestore (במקום מ-GitHub)
  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 loadData started');
      try {
        setLoading(true);
        console.log('📥 Fetching app data...');
        const data = await fetchAppData();
        console.log('✅ App data fetched:', data);
        setAppData(data);
        setError(null);
        console.log('✅ App data set successfully');
      } catch (err) {
        console.error('❌ Error loading data:', err);
        setError(`שגיאה בטעינת נתונים מ-Firestore: ${err.message}`);
      } finally {
        setLoading(false);
        console.log('🏁 loadData completed');
      }
    };
    
    loadData();

    // רענון אוטומטי כל 5 דקות
    const interval = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // פונקציה לרענון ידני
  const refreshData = async () => {
    try {
      setLoading(true);
      const data = await fetchAppData();
      setAppData(data);
      setError(null);
    } catch (err) {
      setError(`שגיאה בטעינת נתונים מ-Firestore: ${err.message}`);
      console.error('שגיאה בטעינת נתונים:', err);
    } finally {
      setLoading(false);
    }
  };

  // יצירת מערך של כל המשימות כאשר הנתונים נטענים
  const allTasks = appData ? [
    {
      title: "הפניה ליועץ חיצוני",
      subtasks: [],
    },
    ...appData.mainTasks
  ] : [];

  // מערך של המשימות הסופיות מעץ ההחלטות - נבנה דינמית מהעץ
  const decisionSubtasks = (appData && appData.decisionTrees && selectedTreeId) ? (() => {
    const tasks = new Set();
    const extractFinalTasks = (node) => {
      if (!node) return;
      if (node.finalTask) {
        tasks.add(node.finalTask);
      }
      if (node.options) {
        node.options.forEach(opt => extractFinalTasks(opt));
      }
      if (node.nextQuestion) {
        extractFinalTasks(node.nextQuestion);
      }
    };
    extractFinalTasks(appData.decisionTrees[selectedTreeId]);
    return Array.from(tasks);
  })() : [];

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier.trim()) return;
    if (patientsList.some(p => p.identifier === form.identifier.trim())) return;
    const newPatient = {
      identifier: form.identifier.trim(),
      selectedTasks: [],
      taskSubtasks: {},
      collapsed: {},
      population: "",
      isArchived: false
    };
    await addPatient(newPatient);
    setForm({ identifier: "" });
  };

  const toggleCollapse = (taskTitle) => {
    setCollapsed((prev) => ({ ...prev, [taskTitle]: !prev[taskTitle] }));
  };

  // --- סטייטים עיקריים ---
  const selectedTasksRef = useRef(selectedTasks);
  const taskSubtasksRef = useRef(taskSubtasks);
  const collapsedRef = useRef(collapsed);

  useEffect(() => { selectedTasksRef.current = selectedTasks; }, [selectedTasks]);
  useEffect(() => { taskSubtasksRef.current = taskSubtasks; }, [taskSubtasks]);
  useEffect(() => { collapsedRef.current = collapsed; }, [collapsed]);

  // פונקציה אחידה להוספה/עדכון/הסרה של משימה לתיק
  const addOrUpdateTaskToPatient = async (taskTitle, action = 'add', options = {}) => {
    console.log('🔍 addOrUpdateTaskToPatient called:', { taskTitle, action, options });
    if (!patient) {
      console.log('❌ No patient selected');
      return;
    }
    
    const task = allTasks.find(t => t.title === taskTitle);
    if (!task) {
      console.log('❌ Task not found:', taskTitle);
      return;
    }
    
    // שימוש בסטייטים הכי עדכניים
    const selectedTasks = selectedTasksRef.current;
    const taskSubtasks = taskSubtasksRef.current;
    const collapsed = collapsedRef.current;
    
    let newSelectedTasks, newTaskSubtasks, newCollapsed;
    
    switch (action) {
      case 'add':
        if (selectedTasks.includes(taskTitle)) {
          console.log('⚠️ Task already exists:', taskTitle);
          return;
        }
        newSelectedTasks = [...selectedTasks, taskTitle];
        newTaskSubtasks = { ...taskSubtasks };
        if (task.subtasks.length > 0) {
          newTaskSubtasks[taskTitle] = Array(task.subtasks.length).fill(false);
        } else {
          newTaskSubtasks[taskTitle] = [false];
        }
        newCollapsed = { ...collapsed, [taskTitle]: false };
        if (taskTitle === "שיבוץ לפמי" && !newSelectedTasks.includes("הפניה חדשה")) {
          newSelectedTasks = [...newSelectedTasks, "הפניה חדשה"];
          const t = allTasks.find(t => t.title === "הפניה חדשה");
          if (t) {
            newTaskSubtasks["הפניה חדשה"] = Array(t.subtasks.length).fill(false);
            newCollapsed["הפניה חדשה"] = false;
          }
        }
        console.log('✅ ADD - New state:', { newSelectedTasks, newTaskSubtasks, newCollapsed });
        break;
      case 'remove':
        newSelectedTasks = selectedTasks.filter((t) => t !== taskTitle);
        newTaskSubtasks = { ...taskSubtasks };
        delete newTaskSubtasks[taskTitle];
        newCollapsed = { ...collapsed };
        delete newCollapsed[taskTitle];
        console.log('✅ REMOVE - New state:', { newSelectedTasks, newTaskSubtasks, newCollapsed });
        break;
      case 'check':
        newSelectedTasks = selectedTasks.includes(taskTitle) ? selectedTasks : [...selectedTasks, taskTitle];
        newTaskSubtasks = { ...taskSubtasks };
        if (task.subtasks.length > 0) {
          newTaskSubtasks[taskTitle] = Array(task.subtasks.length).fill(true);
        } else {
          newTaskSubtasks[taskTitle] = [true];
        }
        newCollapsed = { ...collapsed, [taskTitle]: true };
        if (taskTitle === "שיבוץ לפמי" && !newSelectedTasks.includes("הפניה חדשה")) {
          newSelectedTasks = [...newSelectedTasks, "הפניה חדשה"];
          const t = allTasks.find(t => t.title === "הפניה חדשה");
          if (t) {
            newTaskSubtasks["הפניה חדשה"] = Array(t.subtasks.length).fill(true);
            newCollapsed["הפניה חדשה"] = true;
          }
        }
        console.log('✅ CHECK - New state:', { newSelectedTasks, newTaskSubtasks, newCollapsed });
        break;
      case 'uncheck':
        newSelectedTasks = selectedTasks;
        newTaskSubtasks = { ...taskSubtasks };
        if (task.subtasks.length > 0) {
          newTaskSubtasks[taskTitle] = Array(task.subtasks.length).fill(false);
        } else {
          newTaskSubtasks[taskTitle] = [false];
        }
        newCollapsed = { ...collapsed, [taskTitle]: false };
        console.log('✅ UNCHECK - New state:', { newSelectedTasks, newTaskSubtasks, newCollapsed });
        break;
      case 'updateSubtask':
        const { subtaskIndex, checked } = options;
        newSelectedTasks = selectedTasks;
        newTaskSubtasks = { ...taskSubtasks };
        const arr = newTaskSubtasks[taskTitle]?.slice() || [];
        arr[subtaskIndex] = checked;
        newTaskSubtasks[taskTitle] = arr;
        newCollapsed = { ...collapsed };
        if (arr.length > 0 && arr.every(Boolean)) {
          newCollapsed[taskTitle] = true;
        } else {
          newCollapsed[taskTitle] = false;
        }
        console.log('✅ UPDATE SUBTASK - New state:', { newSelectedTasks, newTaskSubtasks, newCollapsed });
        break;
      default:
        console.log('❌ Unknown action:', action);
        return;
    }
    console.log('🔄 Updating local state...');
    setSelectedTasks(newSelectedTasks);
    setTaskSubtasks(newTaskSubtasks);
    setCollapsed(newCollapsed);
    console.log('💾 Saving to server...');
    try {
      await updatePatientTasks({ 
        selectedTasks: newSelectedTasks, 
        taskSubtasks: newTaskSubtasks, 
        collapsed: newCollapsed 
      });
      console.log('✅ Save completed successfully');
    } catch (error) {
      console.error('❌ Save failed:', error);
    }
  };

  const handleTaskCheckbox = (task, checked, fromRemoveMenu = false) => {
    if (task.title === "הפניה ליועץ חיצוני") {
      if (checked) {
        setShowDynamicQuestions(true);
      } else {
        setShowDynamicQuestions(false);
      }
      return;
    }
    
    if (fromRemoveMenu) {
      addOrUpdateTaskToPatient(task.title, 'remove');
    } else if (checked) {
      addOrUpdateTaskToPatient(task.title, 'check');
    } else {
      addOrUpdateTaskToPatient(task.title, 'uncheck');
    }
  };

  const handleSubtaskCheckbox = (taskTitle, idx, event) => {
    event.stopPropagation();
    const newChecked = event.target.checked; // השתמש במצב החדש ישירות
    addOrUpdateTaskToPatient(taskTitle, 'updateSubtask', { 
      subtaskIndex: idx, 
      checked: newChecked 
    });
  };

  const handleDynamicFinish = async (result) => {
    console.log('🌳 handleDynamicFinish called:', result);
    setShowDynamicQuestions(false);
    if (result.finalTask) {
      console.log('🌳 Adding finalTask from tree (with setTimeout):', result.finalTask);
      setTimeout(() => {
        addOrUpdateTaskToPatient(result.finalTask, 'add');
      }, 0);
    }
    if (result.population) {
      if (patient) {
        const updated = { ...patient, population: result.population };
        setPatient(updated);
        await updatePatient(patient.id, updated);
      }
    }
  };

  function isDynamicFinalTask(title) {
    return [
      "הפניה חדשה",
      "השלמת סל ראשונה",
      "השלמת סל שניה ומעלה",
      "הארכה חריגה",
      "שיבוץ לפמי"
    ].includes(title);
  }

  const { total, done } = getAllSubtasks(selectedTasks, taskSubtasks, allTasks);
  const percent = total === 0 ? 0 : (done / total) * 100;

  const openPatient = (p) => {
    console.log('🚪 openPatient called with:', p);
    setShowBackstageView(false);
    if (patient && patient.identifier === p.identifier) {
      console.log('🔄 Closing current patient');
      setPatient(null);
      setSelectedTasks([]);
      setTaskSubtasks({});
      setCollapsed({});
      setShowForm(false);
      setShowDynamicQuestions(false);
    } else {
      console.log('📂 Opening new patient:', p.identifier);
      console.log('📋 Patient data:', { 
        selectedTasks: p.selectedTasks || [], 
        taskSubtasks: p.taskSubtasks || {}, 
        collapsed: p.collapsed || {} 
      });
      setPatient(p);
      setSelectedTasks(p.selectedTasks || []);
      setTaskSubtasks(p.taskSubtasks || {});
      setCollapsed(p.collapsed || {});
      setShowForm(false);
      setShowDynamicQuestions(false);
      console.log('✅ Patient opened successfully');
    }
  };

  // עדכון משימות בתיק ושמירה ב-localStorage
  const updatePatientTasks = async (fields) => {
    console.log('🔄 updatePatientTasks called with fields:', fields);
    if (!patient) {
      console.log('❌ No patient in updatePatientTasks');
      return;
    }
    
    console.log('📊 Current patient:', patient);
    const { total, done } = getAllSubtasks(
      (fields.selectedTasks ?? patient.selectedTasks) || [],
      (fields.taskSubtasks ?? patient.taskSubtasks) || {},
      allTasks
    );
    const percent = total === 0 ? 0 : (done / total) * 100;
    console.log('📈 Calculated progress:', { total, done, percent });
    
    const updated = { ...patient, ...fields, percent };
    console.log('💾 Updated patient data:', updated);
    
    setPatient(updated);
    console.log('🔄 Local state updated');
    
    try {
      console.log('🌐 Calling updatePatient with ID:', patient.id);
      await updatePatient(patient.id, updated);
      console.log('✅ updatePatient completed');
    } catch (error) {
      console.error('❌ Error in updatePatientTasks:', error);
      throw error;
    }
  };

  // עוטף את כל הפונקציות שמעדכנות משימות כך שיעדכנו גם את התיק

  

  const archivePatient = async (identifier) => {
    const patient = patientsList.find(p => p.identifier === identifier);
    if (!patient) return;
    await updatePatient(patient.id, { ...patient, isArchived: true });
    if (patient.identifier === (patient && patient.identifier)) setPatient(null);
  };

  const unarchivePatient = async (identifier) => {
    const patient = archivedPatients.find(p => p.identifier === identifier);
    if (!patient) return;
    await updatePatient(patient.id, { ...patient, isArchived: false });
  };

  // --- הוספת סטייט למודאל מחיקה ---
  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', identifier: null });

  // --- עדכון פונקציות מחיקה ---
  const openDeleteModal = (identifier, fromArchive = false) => {
    setDeleteModal({ open: true, type: 'single', identifier, fromArchive });
  };
  const deleteAllArchived = () => {
    setDeleteModal({ open: true, type: 'all-archive' });
  };
  // --- פונקציה שמבצעת את המחיקה בפועל ---
  const confirmDelete = async () => {
    if (deleteModal.type === 'single') {
      let patientToDelete = deleteModal.fromArchive
        ? archivedPatients.find(p => p.identifier === deleteModal.identifier)
        : patientsList.find(p => p.identifier === deleteModal.identifier);
      if (patientToDelete) {
        await deletePatientFromApi(patientToDelete.id);
        if (patient && patient.identifier === deleteModal.identifier) setPatient(null);
    }
    } else if (deleteModal.type === 'all-archive') {
      for (const p of archivedPatients) {
        await deletePatientFromApi(p.id);
    }
    }
    setDeleteModal({ open: false, type: '', identifier: null });
  };
  const cancelDelete = () => setDeleteModal({ open: false, type: '', identifier: null });

  // חישוב תיקים תואמים לחיפוש
  const filteredPatients = React.useMemo(() => {
    if (!search.trim()) return patientsList;
    const s = search.trim().toLowerCase();
    const matches = patientsList.filter(p => p.identifier.toLowerCase().includes(s));
    const rest = patientsList.filter(p => !p.identifier.toLowerCase().includes(s));
    return [...matches, ...rest];
  }, [patientsList, search]);
  const matchedIds = React.useMemo(() => {
    if (!search.trim()) return [];
    const s = search.trim().toLowerCase();
    return patientsList.filter(p => p.identifier.toLowerCase().includes(s)).map(p => p.identifier);
  }, [patientsList, search]);
  // --- חישוב תיקים תואמים בארכיון ---
  const archivedMatchedIds = React.useMemo(() => {
    if (!search.trim()) return [];
    const s = search.trim().toLowerCase();
    return archivedPatients.filter(p => p.identifier.toLowerCase().includes(s)).map(p => p.identifier);
  }, [archivedPatients, search]);

  // mouse move handler
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      let dx = e.type.startsWith('touch') ? e.touches[0].clientX - startX : e.clientX - startX;
      if (dragging === 'right') {
        let newRightWidth = Math.max(120, Math.min(400, startWidth - dx));
        setRightPanelWidth(newRightWidth);
      } else if (dragging === 'left') {
        let newLeftWidth = Math.max(minLeftPanelWidth, Math.min(400, startWidth + dx));
        setLeftPanelWidth(newLeftWidth);
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, startX, startWidth]);

  // פונקציות ניהול המוני
  const archiveAllPatients = () => {
    setArchivedPatients(prev => [...prev, ...patientsList]);
    setPatientsList([]);
    setPatient(null);
  };
  const unarchiveAllPatients = () => {
    setPatientsList(prev => [...prev, ...archivedPatients]);
    setArchivedPatients([]);
  };

  // סגירת תפריט שלוש נקודות בלחיצה מחוץ
  useEffect(() => {
    if (menuOpenIdx === null) return;
    const handleClick = (e) => {
      if (!menuRef.current) return;
      // אם הלחיצה הייתה בתוך התפריט, לא נסגור
      if (menuRef.current.contains(e.target)) return;
      setMenuOpenIdx(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpenIdx]);

  // משפט אקראי מתחלף כל 30 שניות כאשר אין תיק נבחר
  useEffect(() => {
    if (patient) return;
    const interval = setInterval(() => {
      setIdleQuoteIdx(idx => {
        let next = Math.floor(Math.random() * idleQuotes.length);
        // לא לחזור על אותו משפט פעמיים ברצף
        while (next === idx && idleQuotes.length > 1) {
          next = Math.floor(Math.random() * idleQuotes.length);
        }
        return next;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [patient]);

  // מימוש לפונקציה שמתווספת למשימות דרך עץ ההחלטות - מוחלף בפונקציה האחידה
  // const addTaskWithDependencies = (taskTitle) => { ... } - נמחק

  // קבועים לכרטיסיות
  const CIRCLE_SIZE = 64;
  const CARD_PADDING = 10;
  const CARD_WIDTH = CIRCLE_SIZE + 2 * CARD_PADDING;
  const ARCHIVE_ICON_SIZE = 18;
  const CARD_HEIGHT = CARD_PADDING * 2 + CIRCLE_SIZE + 54 + ARCHIVE_ICON_SIZE;
  const MIN_COLS = 1;
  const MAX_COLS = 5;

  function getAllSubtasks(selectedTasks, taskSubtasks, tasks) {
    let total = 0, done = 0;
    for (const taskTitle of selectedTasks) {
      const task = tasks.find(t => t.title === taskTitle);
      if (!task) continue;
      const subtasksArr = taskSubtasks[taskTitle];
      if (task.subtasks.length === 0) {
        total += 1;
        if (subtasksArr && subtasksArr[0]) done += 1;
      } else {
        total += task.subtasks.length;
        if (subtasksArr) done += subtasksArr.filter(Boolean).length;
      }
    }
    return { total, done };
  }

  // חישוב minLeftPanelWidth דינמי
  const CARD_MIN_WIDTH = 116; // כרטיסיה
  const BUTTON_MIN_WIDTH = 180; // כפתור רחב
  const PANEL_PADDING = 32; // padding פנימי
  const GRID_GAP = 16; // ריווח בין כרטיסיות
  const minLeftPanelWidth = Math.max(CARD_MIN_WIDTH, BUTTON_MIN_WIDTH) + PANEL_PADDING + GRID_GAP;

  // פונקציה לסיווג המשימות לקבוצות
  const categorizeTasks = () => {
    if (!appData) return { independent: [], dependent: [], decisionTrees: [] };
    
    const independent = [];
    const dependent = [];
    let decisionTrees = [];
    
    // הוספת כל העצים תחת decisionTrees
    if (appData.decisionTrees) {
      decisionTrees = Object.values(appData.decisionTrees);
    }
    
    // איסוף כל המשימות הסופיות מכל העצים
    const allFinalTasks = new Set();
    const extractFinalTasks = (node) => {
      if (!node) return;
      if (node.finalTask) allFinalTasks.add(node.finalTask);
      if (node.options) node.options.forEach(opt => extractFinalTasks(opt));
      if (node.nextQuestion) extractFinalTasks(node.nextQuestion);
    };
    Object.values(appData.decisionTrees || {}).forEach(tree => extractFinalTasks(tree));
    
    allTasks.forEach(task => {
      if (decisionSubtasks.includes(task.title)) {
        dependent.push(task);
      } else if (!decisionTrees.some(tree => tree.title === task.title) && !allFinalTasks.has(task.title)) {
        independent.push(task);
      }
    });
    
    return { independent, dependent, decisionTrees };
  };

  const { independent, dependent, decisionTrees } = categorizeTasks();

  // --- טען הערות מה-Firestore כאשר תיק נבחר ---
  useEffect(() => {
    if (patient && patient.notes !== undefined) {
      setNotes(patient.notes);
    } else if (patient) {
      setNotes("");
    }
  }, [patient]);

  // --- שמור הערות ב-Firestore בכל שינוי ---
  useEffect(() => {
    if (patient && patient.id !== undefined) {
      // שמור רק אם הערך השתנה
      if (notes !== patient.notes) {
        updatePatient(patient.id, { ...patient, notes });
      }
    }
    // eslint-disable-next-line
  }, [notes]);

  // פונקציה לעדכון שם התיק
  const updatePatientName = async (newName) => {
    if (!patient || !newName.trim()) return;
    const trimmedName = newName.trim();
    if (patientsList.some(p => p.identifier === trimmedName && p.identifier !== patient.identifier)) {
      alert('שם התיק כבר קיים במערכת');
      return;
    }
    const updated = { ...patient, identifier: trimmedName };
    setPatient(updated);
    await updatePatient(patient.id, updated);
    const patients = await getPatients();
    setPatientsList(patients.filter(p => !p.isArchived));
    setArchivedPatients(patients.filter(p => p.isArchived));
    setEditingPatientName(false);
  };

  // פונקציה להתחלת עריכת שם
  const startEditingPatientName = () => {
    setEditingPatientNameValue(patient?.identifier || "");
    setEditingPatientName(true);
  };

  // פונקציה לביטול עריכת שם
  const cancelEditingPatientName = () => {
    setEditingPatientName(false);
    setEditingPatientNameValue("");
  };

  // useEffect לטעינת תיקים מ-Firestore בלבד (טעינה ראשונית)
  useEffect(() => {
    const unsubscribe = subscribeToPatients((patients, error) => {
      if (error) {
        setError('שגיאה בטעינת תיקים מה-שרת: ' + error.message);
        return;
      }
      const activePatients = patients.filter(p => !p.isArchived);
      const archivedPatientsList = patients.filter(p => p.isArchived);
      setPatientsList(activePatients);
      setArchivedPatients(archivedPatientsList);
    });
    return () => unsubscribe();
  }, []);

  // הוספת סטייט לשליטה בדרופדאון
  const [showDropdown, setShowDropdown] = useState(false);

  // חישוב תוצאות חיפוש לכל התיקים (כולל ארכיון)
  const allMatchingPatients = React.useMemo(() => {
    if (!search.trim()) return [];
    const s = search.trim().toLowerCase();
    const regular = patientsList.filter(p => p.identifier.toLowerCase().includes(s)).map(p => ({ ...p, isArchived: false }));
    const archived = archivedPatients.filter(p => p.identifier.toLowerCase().includes(s)).map(p => ({ ...p, isArchived: true }));
    return [...regular, ...archived];
  }, [patientsList, archivedPatients, search]);

  const [showBackstagePasswordModal, setShowBackstagePasswordModal] = useState(false);
  const [backstagePasswordInput, setBackstagePasswordInput] = useState('');
  const [backstagePasswordError, setBackstagePasswordError] = useState('');

  // --- סטייט לעצי החלטה מרובים ---
  const [showAddTreeModal, setShowAddTreeModal] = useState(false);
  const [newTreeTitle, setNewTreeTitle] = useState("");

  const handleAddTree = () => {
    setShowAddTreeModal(true);
    setNewTreeTitle("");
  };

  const handleSaveNewTree = (e) => {
    e.preventDefault();
    if (!newTreeTitle.trim()) return;
    const id = Date.now().toString();
    const newTree = {
      title: newTreeTitle,
      initialQuestion: "שאלה ראשית חדשה",
      options: []
    };
    const updatedTrees = {
      ...(appData.decisionTrees || {}),
      [id]: newTree
    };
    console.log('handleSaveNewTree: new id:', id, 'updatedTrees:', updatedTrees);
    setAppData({ ...appData, decisionTrees: updatedTrees });
    setAppDataFirestore({ ...appData, decisionTrees: updatedTrees });
    setShowAddTreeModal(false);
    setNewTreeTitle("");
    setSelectedTreeId(id);
  };

  // הצגת עץ החלטה
  const currentTree = (appData && appData.decisionTrees && selectedTreeId)
    ? appData.decisionTrees[selectedTreeId]
    : null;
  console.log('currentTree:', currentTree);

  // מחיקת עץ החלטה
  const handleDeleteTree = (treeId) => {
    if (!appData?.decisionTrees?.[treeId]) return;
    const updatedTrees = { ...appData.decisionTrees };
    delete updatedTrees[treeId];
    let newSelected = selectedTreeId;
    if (selectedTreeId === treeId) {
      const keys = Object.keys(updatedTrees);
      newSelected = keys.length > 0 ? keys[0] : null;
    }
    setAppData({ ...appData, decisionTrees: updatedTrees });
    setAppDataFirestore({ ...appData, decisionTrees: updatedTrees });
    setSelectedTreeId(newSelected);
  };

  // סטייט למחיקת עץ החלטה
  const [treeToDelete, setTreeToDelete] = useState(null);

  // סטייט להערות משימות שוטפות
  const [routineNotes, setRoutineNotesState] = useState("");
  const routineNotesRef = useRef("");

  // טען הערות משימות שוטפות מה-Firestore
  useEffect(() => {
    const unsubscribe = subscribeToRoutineNotes((notes, error) => {
      if (error) return;
      setRoutineNotesState(notes);
      routineNotesRef.current = notes;
    });
    return () => unsubscribe();
  }, []);

  // שמור הערות משימות שוטפות ב-Firestore בכל שינוי (רק אם שונה)
  useEffect(() => {
    if (routineNotes !== routineNotesRef.current) {
      const timeout = setTimeout(() => {
        setRoutineNotes(routineNotes);
        routineNotesRef.current = routineNotes;
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [routineNotes]);

  // סנכרון אוטומטי של התיק הנבחר עם רשימת התיקים (patientsList)
  useEffect(() => {
    if (!patient) return;
    const updated = patientsList.find(p => p.id === patient.id);
    if (updated && JSON.stringify(updated) !== JSON.stringify(patient)) {
      setPatient(updated);
      setSelectedTasks(updated.selectedTasks || []);
      setTaskSubtasks(updated.taskSubtasks || {});
      setCollapsed(updated.collapsed || {});
    }
  }, [patientsList, patient]);

  // סטייט להערות פוטנציאל הפניה
  const [potentialReferralNotes, setPotentialReferralNotesState] = useState("");
  const potentialReferralNotesRef = useRef("");

  // טען הערות פוטנציאל הפניה מה-Firestore
  useEffect(() => {
    const unsubscribe = subscribeToPotentialReferralNotes((notes, error) => {
      if (error) return;
      setPotentialReferralNotesState(notes);
      potentialReferralNotesRef.current = notes;
    });
    return () => unsubscribe();
  }, []);

  // שמור הערות פוטנציאל הפניה ב-Firestore בכל שינוי (רק אם שונה)
  useEffect(() => {
    if (potentialReferralNotes !== potentialReferralNotesRef.current) {
      const timeout = setTimeout(() => {
        setPotentialReferralNotes(potentialReferralNotes);
        potentialReferralNotesRef.current = potentialReferralNotes;
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [potentialReferralNotes]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#8D7350'
      }}>
        טוען נתונים...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#d32f2f',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ marginBottom: '20px', maxWidth: '500px' }}>
          <h2 style={{ color: '#d32f2f', marginBottom: '15px' }}>שגיאה בטעינת נתונים</h2>
          <div style={{ fontSize: '16px', lineHeight: '1.5' }}>{error}</div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={refreshData}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: loading ? '#ccc' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'טוען...' : 'נסה שוב'}
          </button>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#f7f7f7',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            רענן דף
          </button>
        </div>
      </div>
    );
  }

  const handleExportWorkflow = async () => {
    try {
      const data = await getAppData();
      const now = new Date();
      const pad = n => n.toString().padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
      const filename = `patient-task-workflow-export-${dateStr}.json`;
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);
    } catch (err) {
      alert('שגיאה בייצוא הנתונים: ' + err.message);
    }
  };

  return (
    <div className="app-outer-wrapper">
      {/* Header */}
      <header className="main-header">
        <img src={mermaidLogo} alt="לוגו אשף המשימות" className="main-logo" />
        <div className="header-titles">
          <h1 className="main-title">מאיה צריכה לבחור שם...</h1>
          <h2 className="sub-title">מכון הקבע חיל האוויר</h2>
        </div>
        <div className="header-actions" style={{ position: 'relative' }}>
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setShowDropdown(!!e.target.value);
            }}
            placeholder="חפש תיק לפי שם..."
            dir="rtl"
            style={{ maxWidth: 220, fontSize: 16, padding: '7px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#fff', textAlign: 'right', marginLeft: 8 }}
            className="text-right"
            onFocus={() => setShowDropdown(!!search)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />
          {showDropdown && allMatchingPatients.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 40,
              right: 0,
              left: 0,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 8,
              boxShadow: '0 2px 8px #e6e0d2',
              zIndex: 9999,
              maxHeight: 260,
              overflowY: 'auto',
              direction: 'rtl',
              fontSize: 15
            }}>
              {allMatchingPatients.map((p, idx) => (
                <div
                  key={p.identifier + (p.isArchived ? '-archived' : '')}
                  style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: idx < allMatchingPatients.length-1 ? '1px solid #eee' : 'none', color: p.isArchived ? '#888' : '#333', background: p.isArchived ? '#f7f7f7' : '#fff' }}
                  onMouseDown={() => {
                    openPatient(p);
                    setShowDropdown(false);
                  }}
                  title={p.isArchived ? 'תיק בארכיון' : 'תיק פעיל'}
                >
                  {p.identifier} {p.isArchived && <span style={{ fontSize: 13, color: '#bfae7e' }}>(בארכיון)</span>}
                </div>
              ))}
            </div>
          )}
          <form
            className="add-patient-form"
            dir="rtl"
            onSubmit={handleFormSubmit}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <input
              name="identifier"
              value={form.identifier}
              onChange={handleFormChange}
              required
              placeholder="תיק חדש (לדוג' ת.ש 658)"
              dir="rtl"
              className="text-right"
              style={{ maxWidth: 180, fontSize: 16, padding: '7px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#fff', textAlign: 'right' }}
            />
            <button type="submit" style={{ fontWeight: 'bold', fontSize: 15, padding: '7px 16px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none' }}>הוסף</button>
          </form>
        </div>
        <button
          onClick={() => { setShowBackstagePasswordModal(true); setBackstagePasswordInput(''); setBackstagePasswordError(''); setPatient(null); }}
          style={{
            marginRight: 'auto',
            marginLeft: 16,
            padding: '10px 18px',
            background: '#8D7350',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.2s',
            alignSelf: 'center',
            height: 44
          }}
          onMouseEnter={e => e.target.style.background = '#6B5B47'}
          onMouseLeave={e => e.target.style.background = '#8D7350'}
        >
          <FaCog size={22} style={{ verticalAlign: 'middle', color: '#fff' }} />
        </button>
        <button
          onClick={() => { setPatient(null); setShowBackstageView(false); }}
          style={{
            marginLeft: 8,
            padding: '10px 18px',
            background: '#CBB994',
            color: '#4E342E',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.2s',
            alignSelf: 'center',
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={e => e.target.style.background = '#B8A77A'}
          onMouseLeave={e => e.target.style.background = '#CBB994'}
        >
          <FaHome size={22} style={{ verticalAlign: 'middle' }} />
        </button>
      </header>
      <div className="app-root" style={{ display: 'flex', flexDirection: 'row', width: '100vw', minHeight: '100vh' }}>
        {/* פאנל המשימות השוטפות - ימין */}
        <div
          className="routine-tasks-panel"
          style={{ width: rightPanelWidth, minWidth: 120, maxWidth: 400, transition: dragging === 'right' ? 'none' : 'width 0.15s', direction: 'rtl' }}
        >
          <div className="routine-tasks-title">משימות שוטפות</div>
          <hr className="routine-tasks-divider" />
          <div>
            {appData ? appData.routineTasks.map((task, idx) => (
              <div className="routine-task-card" key={task}>
                <input
                  type="checkbox"
                  className="routine-task-checkbox"
                  checked={routineChecked[idx]}
                  onChange={() => handleRoutineCheck(idx)}
                />
                <span className={"routine-task-label" + (routineChecked[idx] ? " strike" : "")}>{task}</span>
              </div>
            )) : null}
          </div>
          {/* שדה הערות חופשי למשימות שוטפות */}

        </div>
        {/* פס גרירה ימני */}
        <div
          className="resize-handle right"
          style={{ cursor: 'ew-resize', width: 8, background: dragging === 'right' ? '#90caf9' : 'transparent', zIndex: 10 }}
          onMouseDown={e => { setDragging('right'); setStartX(e.clientX); setStartWidth(rightPanelWidth); }}
          onTouchStart={e => { setDragging('right'); setStartX(e.touches[0].clientX); setStartWidth(rightPanelWidth); }}
        />
        {/* מרכז */}
        <div className="main-content" style={{ flex: 1, minWidth: 0, maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          
          {/* התוכן המרכזי: מאחורי הקלעים / ניהול תיק / ציטוט */}
          {showBackstageView ? (
            <div className="backstage-view text-right" dir="rtl">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, color: '#8D7350', fontSize: 28 }}>מאחורי הקלעים - עריכת נתונים</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* שורת כפתורים עליונה במסך מאחורי הקלעים */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {saving && (
                      <div style={{ 
                        padding: '8px 16px', 
                        background: '#FFA726', 
                        color: '#fff', 
                        borderRadius: 6, 
                        fontSize: 14 
                      }}>
                        שומר...
                      </div>
                    )}
                    {saveMessage && (
                      <div style={{ 
                        padding: '8px 16px', 
                        background: saveMessage.type === 'success' ? '#4CAF50' : '#f44336', 
                        color: '#fff', 
                        borderRadius: 6, 
                        fontSize: 14 
                      }}>
                        {saveMessage.text}
                      </div>
                    )}
                    <button
                      onClick={refreshData}
                      disabled={loading}
                      style={{
                        padding: '8px 16px',
                        background: loading ? '#ccc' : '#4CAF50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading ? 'טוען...' : 'רענן נתונים'}
                    </button>
                    <button
                      onClick={handleExportWorkflow}
                      style={{
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 16px',
                        fontSize: 14,
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ייצא נתוני Workflow
                    </button>
                    <button
                      onClick={() => setShowBackstageView(false)}
                      style={{
                        padding: '8px 16px',
                        background: '#f7f7f7',
                        color: '#333',
                        border: '1px solid #ccc',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      סגור
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ color: '#8D7350', fontSize: 22, margin: 0, borderBottom: '2px solid #CBB994', paddingBottom: 8 }}>
                    רשימת המשימות
                  </h3>
                            <button
                    onClick={() => {
                      const newTask = {
                        title: "משימה חדשה",
                        subtasks: []
                      };
                      addMainTask(newTask);
                              }}
                    style={{
                      padding: '8px 16px',
                      background: '#4CAF50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                            >
                    הוסף משימה
                            </button>
                          </div>
                <MainTasksEditor
                  mainTasks={appData?.mainTasks || []}
                  onUpdate={updateMainTask}
                  onAdd={addMainTask}
                  onDelete={deleteMainTask}
                              />
                        </div>
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ color: '#8D7350', fontSize: 22, margin: 0, borderBottom: '2px solid #CBB994', paddingBottom: 8 }}>
                    משימות שוטפות
                  </h3>
                  <button
                    onClick={() => addRoutineTask("משימה שוטפת חדשה")}
                    style={{
                      padding: '8px 16px',
                      background: '#4CAF50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    הוסף משימה
                  </button>
                </div>
                <RoutineTasksEditor
                  routineTasks={appData?.routineTasks || []}
                  onUpdate={updateRoutineTask}
                  onAdd={addRoutineTask}
                  onDelete={deleteRoutineTask}
                />
                <h3 style={{ color: '#8D7350', fontSize: 22, marginBottom: 20, borderBottom: '2px solid #CBB994', paddingBottom: 8 }}>
              עצי החלטה
            </h3>
            <button onClick={handleAddTree} style={{ marginBottom: 16, background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' }}>
              הוסף עץ החלטות חדש
            </button>
            {showAddTreeModal && (
              <form onSubmit={handleSaveNewTree} style={{ marginBottom: 16, background: '#fff', border: '1px solid #CBB994', borderRadius: 8, padding: 16, maxWidth: 320 }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 'bold', color: '#8D7350' }}>שם העץ:</label>
                  <input
                    type="text"
                    value={newTreeTitle}
                    onChange={e => setNewTreeTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ccc', fontSize: 15, marginTop: 4 }}
                  />
                </div>
                <button type="submit" style={{ background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', marginLeft: 8 }}>שמור</button>
                <button type="button" onClick={() => setShowAddTreeModal(false)} style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' }}>ביטול</button>
              </form>
            )}
            {appData?.decisionTrees && Object.keys(appData.decisionTrees).length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {Object.entries(appData.decisionTrees).map(([id, tree]) => (
                  <li key={id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => setSelectedTreeId(id)}
                      style={{
                        background: selectedTreeId === id ? '#CBB994' : '#fafafa',
                        color: '#4E342E',
                        border: '1px solid #CBB994',
                        borderRadius: 6,
                        padding: '8px 12px',
                        fontWeight: selectedTreeId === id ? 'bold' : 'normal',
                        cursor: 'pointer',
                        minWidth: 80
                      }}
                    >
                      {tree.title}
                    </button>
                    <button
                      onClick={() => setTreeToDelete(id)}
                      style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', fontSize: 18, padding: 0 }}
                      title="מחק עץ החלטה"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {/* מודאל אישור מחיקה */}
            {treeToDelete && (
              <div style={{ position: 'fixed', top: 0, right: 0, left: 0, bottom: 0, background: '#0008', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 300, boxShadow: '0 2px 12px #cbb99433', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, color: '#8D7350', marginBottom: 18 }}>האם למחוק את עץ ההחלטה "{appData.decisionTrees[treeToDelete]?.title}"?</div>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <button onClick={() => { handleDeleteTree(treeToDelete); setTreeToDelete(null); }} style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>מחק</button>
                    <button onClick={() => setTreeToDelete(null)} style={{ background: '#fafafa', color: '#4E342E', border: '1px solid #CBB994', borderRadius: 6, padding: '8px 18px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>ביטול</button>
                  </div>
                </div>
              </div>
            )}
            <div style={{ padding: '0 16px' }}>
              <DecisionTreeEditor
                key={selectedTreeId}
                decisionTree={getCurrentDecisionTree()}
                mainTasks={appData?.mainTasks || []}
                onUpdate={updateDecisionTree}
              />
            </div>
                            </div>
              <div style={{ marginBottom: 40 }}>
                
              
          </div>
        </div>
          ) : patient ? (
            <div className="patient-card text-right" dir="rtl" style={{ maxWidth: 480, margin: '0 auto', background: '#fffbea', borderRadius: 16, boxShadow: '0 2px 8px #e6e0d2', padding: 24, position: 'relative' }}>
              
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                {editingPatientName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <input
                      type="text"
                      value={editingPatientNameValue}
                      onChange={(e) => setEditingPatientNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updatePatientName(editingPatientNameValue);
                        } else if (e.key === 'Escape') {
                          cancelEditingPatientName();
                        }
                      }}
                      autoFocus
                      style={{
                        fontSize: 28,
                        fontWeight: 'bold',
                        color: '#8D7350',
                        background: 'transparent',
                        border: '2px solid #8D7350',
                        borderRadius: 6,
                        padding: '4px 8px',
                        width: '100%',
                        textAlign: 'right',
                        direction: 'rtl'
                      }}
                    />
                    <button
                      onClick={() => updatePatientName(editingPatientNameValue)}
                      style={{
                        padding: '4px 8px',
                        background: '#4CAF50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        minWidth: 'auto'
                      }}
                    >
                      שמור
                    </button>
                    <button
                      onClick={cancelEditingPatientName}
                      style={{
                        padding: '4px 8px',
                        background: '#f44336',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        minWidth: 'auto'
                      }}
                    >
                      בטל
                    </button>
                  </div>
                ) : (
                  <h2 
                    style={{ 
                      margin: 0, 
                      color: '#8D7350', 
                      fontSize: 28, 
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                      transition: 'background 0.2s'
                    }}
                    onClick={startEditingPatientName}
                    onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    title="לחץ לעריכת שם התיק"
                  >
                    {patient?.identifier || 'תיק לא ידוע'}
                  </h2>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setPatient(null)}
                style={{
                      padding: '8px 16px',
                      background: '#f7f7f7',
                      color: '#333',
                      border: '1px solid #ccc',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 'bold',
                      cursor: 'pointer'
                }}
              >
                    סגור תיק
                  </button>
                </div>
                </div>
                {showDynamicQuestions && (
                <DynamicQuestions
                  decisionTree={getCurrentDecisionTree()}
                  onFinish={handleDynamicFinish}
                  onClose={() => setShowDynamicQuestions(false)}
                />
                )}
              <div style={{ marginBottom: 24 }}>
                {/* --- הצגת כל המשימות האפשריות לבחירה (פיצ'ר בחירת משימות לתיק) --- */}
                <h3 style={{ color: '#8D7350', fontSize: 20, marginBottom: 12 }}>בחר משימות לתיק</h3>
                
                <ul className="all-tasks-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 18 }}>
                  {independent.map((task) => (
                    <li key={task.title} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: '#4E342E', fontWeight: 'normal', background: 'none', border: 'none', padding: '2px 0' }}>
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.title)}
                        onChange={e => {
                          if (e.target.checked) {
                            addOrUpdateTaskToPatient(task.title, 'add');
                          } else {
                            addOrUpdateTaskToPatient(task.title, 'remove');
                          }
                        }}
                        style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, maxWidth: 16, maxHeight: 16 }}
                      />
                      <span>{task.title}</span>
                    </li>
                  ))}
                  {Object.entries(appData.decisionTrees).map(([id, tree]) => {
                    const treeFinalTasks = (() => {
                      const tasks = new Set();
                      const extractFinalTasks = (node) => {
                        if (!node) return;
                        if (node.finalTask) tasks.add(node.finalTask);
                        if (node.options) node.options.forEach(opt => extractFinalTasks(opt));
                        if (node.nextQuestion) extractFinalTasks(node.nextQuestion);
                      };
                      extractFinalTasks(tree);
                      return Array.from(tasks);
                    })();
                    return (
                      <React.Fragment key={id}>
                        <li
                          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: '#4E342E', fontWeight: 'normal', background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => { setSelectedTreeId(id); setShowDynamicQuestions(true); }}
                          tabIndex={0}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setSelectedTreeId(id); setShowDynamicQuestions(true); }}}
                        >
                          <span style={{ textDecoration: 'underline dotted', fontWeight: 500 }}>{tree.title}</span>
                        </li>
                        {treeFinalTasks.map((depTaskTitle) => (
                          <li key={depTaskTitle} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#4E342E', fontWeight: 'normal', background: 'none', border: 'none', padding: '2px 0 2px 0', marginRight: 24 }}>
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(depTaskTitle)}
                              onChange={e => {
                                if (e.target.checked) {
                                  addOrUpdateTaskToPatient(depTaskTitle, 'add');
                                } else {
                                  addOrUpdateTaskToPatient(depTaskTitle, 'remove');
                                }
                              }}
                              style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, maxWidth: 16, maxHeight: 16 }}
                            />
                            <span>{depTaskTitle}</span>
                          </li>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </ul>
                  
                          </div>
                {/* --- משימות נבחרות (משימות בתיק) --- */}
                {patient && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ color: '#8D7350', fontSize: 20, marginBottom: 16 }}>משימות נבחרות</h3>
                    {/* פס התקדמות אופקי */}
                    <div style={{ margin: '0 0 16px 0', width: '100%' }}>
                      <div style={{
                        background: '#eee',
                        borderRadius: 8,
                        height: 18,
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: '#8D7350',
                          height: '100%',
                          width: percent + '%',
                          borderRadius: 8,
                          transition: 'width 0.3s'
                        }} />
                        <span style={{
                          position: 'absolute',
                          left: 12,
                          top: 0,
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#000000',
                          fontWeight: 'bold',
                          fontSize: 14
                        }}>{Math.round(percent)}%</span>
                      </div>
                    </div>
                    {selectedTasks.length === 0 ? (
                      <div style={{ color: '#888', fontSize: 16, textAlign: 'center', padding: '20px 0' }}>
                        לא נבחרו משימות עדיין
                      </div>
                    ) : (
                      selectedTasks.map((taskTitle, index) => {
                        const task = allTasks.find(t => t.title === taskTitle) || { title: taskTitle, subtasks: [] };
                        const subtasksArr = taskSubtasks[taskTitle] || (task.subtasks.length > 0 ? Array(task.subtasks.length).fill(false) : [false]);
                        return (
                          <div key={taskTitle} className="added-task-block" style={{ marginBottom: 10, borderRadius: 8, boxShadow: '0 1px 4px #e6e0d2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <input
                                        type="checkbox"
                                  checked={subtasksArr.length > 0 && subtasksArr.every(Boolean)}
                                  onChange={e => handleTaskCheckbox(task, e.target.checked)}
                                  style={{ transform: 'scale(1.2)', width: 16, height: 16, minWidth: 16, minHeight: 16, maxWidth: 16, maxHeight: 16 }}
                                />
                                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#4E342E', textDecoration: subtasksArr.length > 0 && subtasksArr.every(Boolean) ? 'line-through' : 'none' }}>
                                  {taskTitle}
                                </span>
                              </div>
                              <button
                                onClick={() => toggleCollapse(taskTitle)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#8D7350' }}
                              >
                                {collapsed[taskTitle] ? '▼' : '▲'}
                              </button>
                            </div>
                            {!collapsed[taskTitle] && task.subtasks.length > 0 && (
                              <ul className="subtasks" style={{ marginRight: 24, marginTop: 8, padding: 0, listStyle: 'none' }}>
                                {task.subtasks.map((sub, idx) => (
                                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <input
                                      type="checkbox"
                                      checked={!!subtasksArr[idx]}
                                      onChange={e => handleSubtaskCheckbox(taskTitle, idx, e)}
                                      style={{ transform: 'scale(1.1)', width: 16, height: 16, minWidth: 16, minHeight: 16, maxWidth: 16, maxHeight: 16 }}
                                    />
                                    <span style={{ fontSize: 14, color: '#666', textDecoration: subtasksArr[idx] ? 'line-through' : 'none' }}>
                                      {sub}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })
                    )}
                    </div>
                  )}
                {/* --- הוסף שדה הערות חופשיות לתוך דף ניהול תיק נבחר (מתחת למשימות נבחרות) --- */}
                {patient && (
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ color: '#8D7350', fontSize: 20, marginBottom: 10 }}>הערות חופשיות</h3>
                    <RichTextEditor
                      value={notes}
                      onChange={setNotes}
                      placeholder="הוסף כאן הערות חופשיות..."
                    />
                  </div>
                )}
              </div>
            
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 80 }}>
              <div style={{ color: '#888', marginTop: 80, fontSize: 22, textAlign: 'center', lineHeight: 1.5, marginBottom: 40 }}>
                {idleQuotes[idleQuoteIdx]}
              </div>
              <div style={{ width: '100%', maxWidth: 1200, display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap', margin: '0 auto' }}>
                <div style={{ flex: 1, minWidth: 320, maxWidth: 600 }}>
                  <label htmlFor="routine-notes" style={{ color: '#8D7350', fontWeight: 'bold', fontSize: 18, marginBottom: 8, display: 'block', textAlign: 'center' }}>
                    פתקים, הערות, תזכורות
                  </label>
                  <RichTextEditor
                    value={routineNotes}
                    onChange={setRoutineNotesState}
                    placeholder="כתוב כאן טקסט חופשי..."
                  />
                </div>
                <div style={{ flex: 1, minWidth: 320, maxWidth: 600 }}>
                  <label htmlFor="potential-referral-notes" style={{ color: '#8D7350', fontWeight: 'bold', fontSize: 18, marginBottom: 8, display: 'block', textAlign: 'center' }}>
                    פוטנציאל הפניה
                  </label>
                  <RichTextEditor
                    value={potentialReferralNotes}
                    onChange={setPotentialReferralNotesState}
                    placeholder="כתוב כאן טקסט חופשי..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        {/* פס גרירה שמאלי */}
        <div
          className="resize-handle left"
          style={{ cursor: 'ew-resize', width: 8, background: dragging === 'left' ? '#90caf9' : 'transparent', zIndex: 10 }}
          onMouseDown={e => { setDragging('left'); setStartX(e.clientX); setStartWidth(leftPanelWidth); }}
          onTouchStart={e => { setDragging('left'); setStartX(e.touches[0].clientX); setStartWidth(leftPanelWidth); }}
        />
        {/* פאנל ניהול התיקים - שמאל */}
        <div
          className="patients-list-panel"
          style={{ width: leftPanelWidth, minWidth: 120, maxWidth: 400, transition: dragging === 'left' ? 'none' : 'width 0.15s', direction: 'rtl' }}
        >
          <PatientsListPanel
            patientsList={filteredPatients}
            archivedPatients={archivedPatients}
            openPatient={openPatient}
            selectedPatientId={patient?.identifier}
            archivePatient={archivePatient}
            unarchivePatient={unarchivePatient}
            deletePatient={openDeleteModal}
            deleteAllArchived={deleteAllArchived}
            onMenuOpen={setMenuOpenIdx}
            menuOpenIdx={menuOpenIdx}
            menuRef={menuRef}
            archivedMatchedIds={archivedMatchedIds}
            matchedIds={matchedIds}
            leftPanelWidth={leftPanelWidth}
          />
          </div>
        {/* הוספת מודאל לתוך ה-return --- */}
        {deleteModal.open && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #8884', padding: 32, minWidth: 320, maxWidth: 400, textAlign: 'center', direction: 'rtl' }}>
              <div style={{ fontSize: 20, color: '#d32f2f', fontWeight: 'bold', marginBottom: 16 }}>אזהרה: מחיקה בלתי הפיכה!</div>
              <div style={{ fontSize: 16, color: '#333', marginBottom: 24 }}>
                {deleteModal.type === 'single' ? 'האם אתה בטוח שברצונך למחוק את התיק? פעולה זו אינה ניתנת לשחזור.' : 'האם אתה בטוח שברצונך למחוק את כל התיקים בארכיון? פעולה זו אינה ניתנת לשחזור.'}
                  </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <button onClick={confirmDelete} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: 16, padding: '8px 24px', cursor: 'pointer' }}>מחק</button>
                <button onClick={cancelDelete} style={{ background: '#f7f7f7', color: '#333', border: '1px solid #ccc', borderRadius: 8, fontWeight: 'bold', fontSize: 16, padding: '8px 24px', cursor: 'pointer' }}>בטל</button>
                        </div>
                          </div>
                          </div>
                        )}
      </div>
      {/* פוטר */}
      <footer className="main-footer">
        כל הזכויות שמורות לתום שורש, 2025
      </footer>
      {showBackstagePasswordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #8884', padding: 32, minWidth: 320, maxWidth: 400, textAlign: 'center', direction: 'rtl' }}>
            <div style={{ fontSize: 20, color: '#8D7350', fontWeight: 'bold', marginBottom: 16 }}>
              מסך מאחורי הקלעים מאפשר שינוי ועריכה בלתי הפיכים של תהליכי העבודה במכון.<br />אם תרצו להמשיך לעריכת התוכן - הכניסו את הסיסמה:
            </div>
            <input
              type="password"
              value={backstagePasswordInput}
              onChange={e => setBackstagePasswordInput(e.target.value)}
              placeholder="סיסמה"
              style={{ fontSize: 18, padding: '10px 16px', borderRadius: 8, border: '1.5px solid #CBB994', marginBottom: 12, width: '80%', textAlign: 'center' }}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') {
                if (backstagePasswordInput === '1101') {
                  setShowBackstagePasswordModal(false);
                  setShowBackstageView(true);
                  setBackstagePasswordInput('');
                  setBackstagePasswordError('');
                } else {
                  setBackstagePasswordError('סיסמה שגויה, נסו שוב');
                }
              }}}
            />
            <div style={{ color: '#d32f2f', minHeight: 24, marginBottom: 8 }}>{backstagePasswordError}</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              <button
                onClick={() => {
                  if (backstagePasswordInput === '1101') {
                    setShowBackstagePasswordModal(false);
                    setShowBackstageView(true);
                    setBackstagePasswordInput('');
                    setBackstagePasswordError('');
                  } else {
                    setBackstagePasswordError('סיסמה שגויה, נסו שוב');
                  }
                }}
                style={{ background: '#8D7350', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: 16, padding: '8px 24px', cursor: 'pointer' }}
              >
                המשך
              </button>
              <button
                onClick={() => setShowBackstagePasswordModal(false)}
                style={{ background: '#f7f7f7', color: '#333', border: '1px solid #ccc', borderRadius: 8, fontWeight: 'bold', fontSize: 16, padding: '8px 24px', cursor: 'pointer' }}
              >
                בטל
              </button>
            </div>
          </div>
        </div>
      )}
      {showBackstageView && (
        <div className="backstage-view text-right" dir="rtl">
          {/* ... existing code ... */}
          <div style={{ marginBottom: 40 }}>
            
          </div>
          {/* ... existing code ... */}
          {currentTree ? (
            <DecisionTreeEditor
              tree={currentTree}
              onSave={updateDecisionTree}
              // ...שאר הפרופס...
            />
          ) : (
            <div style={{textAlign: 'center', color: '#888', margin: 30}}>
              בחר עץ החלטה לעריכה
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}
