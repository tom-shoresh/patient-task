import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import DynamicQuestions from "./DynamicQuestions";
import CircleProgress from "./CircleProgress";
import { FaArchive } from 'react-icons/fa';

// משפטים אקראיים לתצוגה כאשר אין תיק נבחר
const idleQuotes = [
  "ברוכים הבאים לאשף המשימות",
  "הוסף תיק חדש כדי להתחיל",
  "ניהול משימות יעיל ופשוט",
  "תמיד כאן לעזור לך"
];

// פונקציה לטעינת נתונים מ-GitHub
const fetchAppData = async () => {
  // הוספת timestamp למניעת cache
  const timestamp = new Date().getTime();
  
  try {
    // שימוש ב-GitHub API במקום GitHub Raw
    const response = await fetch(`https://api.github.com/repos/tom-shoresh/patient-task-workflow/contents/app-data.json?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3.raw',
        'User-Agent': 'PatientTaskApp'
      }
    });
    
    if (!response.ok) {
      throw new Error(`שגיאה בטעינת נתונים: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('נתונים נטענו מ-GitHub API:', data);
    return data;
  } catch (apiError) {
    console.log('GitHub API נכשל, מנסה עם Raw...', apiError);
    
    // ניסיון עם GitHub Raw ללא headers מיותרים
    const response = await fetch(`https://raw.githubusercontent.com/tom-shoresh/patient-task-workflow/main/app-data.json?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`שגיאה בטעינת נתונים: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('נתונים נטענו מ-GitHub Raw:', data);
    return data;
  }
};

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [patient, setPatient] = useState(null);
  const [patientsList, setPatientsList] = useState(() => {
    const saved = localStorage.getItem('patientsList');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [taskSubtasks, setTaskSubtasks] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [form, setForm] = useState({ identifier: "" });
  const [showDynamicQuestions, setShowDynamicQuestions] = useState(false);
  const [centerTab, setCenterTab] = useState('add'); // 'add' או 'manage'
  const [archivedPatients, setArchivedPatients] = useState(() => {
    const saved = localStorage.getItem('archivedPatients');
    return saved ? JSON.parse(saved) : [];
  });
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

  // טעינת נתונים מ-GitHub
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchAppData();
        setAppData(data);
        setError(null);
      } catch (err) {
        setError(`שגיאה בטעינת נתונים מ-GitHub: ${err.message}`);
        console.error('שגיאה בטעינת נתונים:', err);
      } finally {
        setLoading(false);
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
      setError(`שגיאה בטעינת נתונים מ-GitHub: ${err.message}`);
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
    ...appData.mainTasks,
    // הוספת משימות מעץ ההחלטות רק אם הן לא קיימות כבר ב-mainTasks
    ...appData.decisionTree.finalTasks
      .filter(taskTitle => !appData.mainTasks.some(mainTask => mainTask.title === taskTitle))
      .map(taskTitle => ({
        title: taskTitle,
        subtasks: []
      }))
  ] : [];

  // מערך של המשימות הסופיות מעץ ההחלטות
  const decisionSubtasks = appData ? appData.decisionTree.finalTasks : [];

  // מצב למשימות שוטפות
  const [routineChecked, setRoutineChecked] = useState([]);

  // עדכון מצב המשימות השוטפות כאשר הנתונים נטענים
  useEffect(() => {
    if (appData) {
      setRoutineChecked(Array(appData.routineTasks.length).fill(false));
    }
  }, [appData]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newPatient = {
      identifier: form.identifier.trim(),
      selectedTasks: [],
      taskSubtasks: {},
      collapsed: {},
      population: ""
    };
    setPatientsList((prev) => [...prev, newPatient]);
    setPatient(newPatient);
    setShowForm(false);
    setSelectedTasks([]);
    setTaskSubtasks({});
    setCollapsed({});
  };

  const toggleCollapse = (taskTitle) => {
    setCollapsed((prev) => ({ ...prev, [taskTitle]: !prev[taskTitle] }));
  };

  const handleTaskCheckbox = (task, checked) => {
    if (task.title === "הפניה ליועץ חיצוני") {
      if (checked) {
        setShowDynamicQuestions(true);
      } else {
        setShowDynamicQuestions(false);
      }
      return;
    }
    let newSelectedTasks, newTaskSubtasks, newCollapsed;
    if (checked) {
      // הוספת משימה
      newSelectedTasks = selectedTasks.includes(task.title) ? selectedTasks : [...selectedTasks, task.title];
      newTaskSubtasks = { ...taskSubtasks };
      if (task.subtasks.length > 0) {
        // אם יש תתי-משימות – אתחול כולן ל-false
        newTaskSubtasks[task.title] = Array(task.subtasks.length).fill(false);
    } else {
        // אם אין תתי-משימות – אתחול יחיד ל-false
        newTaskSubtasks[task.title] = [false];
      }
      newCollapsed = { ...collapsed, [task.title]: false };
      // תלות
      if (task.title === "שיבוץ לפמי" && !newSelectedTasks.includes("הפניה חדשה")) {
        newSelectedTasks = [...newSelectedTasks, "הפניה חדשה"];
        if (!("הפניה חדשה" in newTaskSubtasks)) {
          const t = allTasks.find(t => t.title === "הפניה חדשה");
          newTaskSubtasks["הפניה חדשה"] = Array(t.subtasks.length).fill(false);
        }
        newCollapsed["הפניה חדשה"] = false;
      }
    } else {
      // הסרת משימה
      newSelectedTasks = selectedTasks.filter((t) => t !== task.title);
      newTaskSubtasks = { ...taskSubtasks };
      if (task.subtasks.length > 0) {
        // אם יש תתי-משימות – אתחול כולן ל-false
        newTaskSubtasks[task.title] = Array(task.subtasks.length).fill(false);
      } else {
        // אם אין תתי-משימות – אתחול יחיד ל-false
        newTaskSubtasks[task.title] = [false];
      }
      newCollapsed = { ...collapsed };
      newCollapsed[task.title] = false;
    }
    setSelectedTasks(newSelectedTasks);
    setTaskSubtasks(newTaskSubtasks);
    setCollapsed(newCollapsed);
    updatePatientTasks({ selectedTasks: newSelectedTasks, taskSubtasks: newTaskSubtasks, collapsed: newCollapsed });
  };

  const handleSubtaskCheckbox = (taskTitle, idx, event) => {
    event.stopPropagation();
    const arr = taskSubtasks[taskTitle]?.slice() || [];
      arr[idx] = !arr[idx];
    let newTaskSubtasks = { ...taskSubtasks, [taskTitle]: arr };
    let newCollapsed = { ...collapsed };
        if (arr.length > 0 && arr.every(Boolean)) {
      newCollapsed[taskTitle] = true;
        } else {
      newCollapsed[taskTitle] = false;
    }
    setTaskSubtasks(newTaskSubtasks);
    setCollapsed(newCollapsed);
    updatePatientTasks({ taskSubtasks: newTaskSubtasks, collapsed: newCollapsed });
  };

  const handleDynamicFinish = (finalTaskTitle, populationValue) => {
    setShowDynamicQuestions(false);
    addTaskWithDependencies(finalTaskTitle);
    if (populationValue) {
      setPatientsList((prev) => prev.map(p =>
        p.identifier === patient.identifier ? { ...p, population: populationValue } : p
      ));
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
    if (patient && patient.identifier === p.identifier) {
      setPatient(null);
      setSelectedTasks([]);
      setTaskSubtasks({});
      setCollapsed({});
      setShowForm(false);
      setShowDynamicQuestions(false);
    } else {
      setPatient(p);
      setSelectedTasks(p.selectedTasks || []);
      setTaskSubtasks(p.taskSubtasks || {});
      setCollapsed(p.collapsed || {});
      setShowForm(false);
      setShowDynamicQuestions(false);
    }
  };

  // עדכון משימות בתיק ושמירה ב-localStorage
  const updatePatientTasks = (fields) => {
    if (!patient) return;
    const { total, done } = getAllSubtasks(
      (fields.selectedTasks ?? patient.selectedTasks) || [],
      (fields.taskSubtasks ?? patient.taskSubtasks) || {},
      allTasks
    );
    const percent = total === 0 ? 0 : (done / total) * 100;
    setPatientsList(prev => prev.map(p =>
      p.identifier === patient.identifier ? { ...p, ...fields, percent } : p
    ));
    setPatient(prev => prev ? { ...prev, ...fields, percent } : prev);
  };

  // עוטף את כל הפונקציות שמעדכנות משימות כך שיעדכנו גם את התיק

  // שמירה ל-localStorage בכל שינוי ב-patientsList
  useEffect(() => {
    localStorage.setItem('patientsList', JSON.stringify(patientsList));
  }, [patientsList]);
  

  useEffect(() => {
    localStorage.setItem('archivedPatients', JSON.stringify(archivedPatients));
  }, [archivedPatients]);

  const archivePatient = (identifier) => {
    const patient = patientsList.find(p => p.identifier === identifier);
    if (!patient) return;
    setPatientsList(prev => prev.filter(p => p.identifier !== identifier));
    setArchivedPatients(prev => [...prev, patient]);
    if (patient.identifier === (patient && patient.identifier)) setPatient(null);
  };

  const unarchivePatient = (identifier) => {
    const patient = archivedPatients.find(p => p.identifier === identifier);
    if (!patient) return;
    setArchivedPatients(prev => prev.filter(p => p.identifier !== identifier));
    setPatientsList(prev => [...prev, patient]);
  };

  const deletePatient = (identifier, fromArchive = false) => {
    if (fromArchive) {
      setArchivedPatients(prev => prev.filter(p => p.identifier !== identifier));
    } else {
      setPatientsList(prev => prev.filter(p => p.identifier !== identifier));
      if (patient && patient.identifier === identifier) setPatient(null);
    }
  };

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
        let newLeftWidth = Math.max(120, Math.min(400, startWidth + dx));
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
  const deleteAllArchived = () => {
    setArchivedPatients([]);
    setShowDeleteModal(false);
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

  // מימוש לפונקציה שמתווספת למשימות דרך עץ ההחלטות
  const addTaskWithDependencies = (taskTitle) => {
    if (!taskTitle) return;
    // לא להוסיף פעמיים
    if (selectedTasks.includes(taskTitle)) return;
    const task = allTasks.find(t => t.title === taskTitle);
    if (!task) return;
    // הוספת המשימה ל-selectedTasks
    let newSelectedTasks = [...selectedTasks, taskTitle];
    // אתחול כל תתי-המשימות ל-false (לא הושלמו)
    let newTaskSubtasks = { ...taskSubtasks };
    if (task.subtasks.length > 0) {
      newTaskSubtasks[taskTitle] = Array(task.subtasks.length).fill(false);
    } else {
      // אם אין תתי-משימות – אתחול יחיד ל-false
      newTaskSubtasks[taskTitle] = [false];
    }
    // פתיחה של המשימה (לא collapsed)
    let newCollapsed = { ...collapsed, [taskTitle]: false };
    // טיפול בתלות: אם זו "שיבוץ לפמי" חייבים גם "הפניה חדשה"
    if (taskTitle === "שיבוץ לפמי" && !newSelectedTasks.includes("הפניה חדשה")) {
      newSelectedTasks = [...newSelectedTasks, "הפניה חדשה"];
      const t = allTasks.find(t => t.title === "הפניה חדשה");
      if (t) {
        newTaskSubtasks["הפניה חדשה"] = Array(t.subtasks.length).fill(false);
        newCollapsed["הפניה חדשה"] = false;
      }
    }
    setSelectedTasks(newSelectedTasks);
    setTaskSubtasks(newTaskSubtasks);
    setCollapsed(newCollapsed);
    updatePatientTasks({ selectedTasks: newSelectedTasks, taskSubtasks: newTaskSubtasks, collapsed: newCollapsed });
  };

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

  // מצב טעינה
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

  // מצב שגיאה
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

  return (
    <div className="app-root" style={{ display: 'flex', flexDirection: 'row', width: '100vw', minHeight: '100vh' }}>
      {/* כפתור רענון נתונים בפינה העליונה */}
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        left: 10, 
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <button
          onClick={refreshData}
          disabled={loading}
          title="רענן נתונים מ-GitHub"
          style={{
            padding: '8px 12px',
            background: loading ? '#ccc' : '#2196F3',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {loading ? '⏳' : '🔄'}
        </button>
        {appData && (
          <div style={{
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            textAlign: 'center'
          }}>
            נתונים מעודכנים
          </div>
        )}
      </div>

      {/* פאנל ימין */}
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
                onChange={() => setRoutineChecked(checked => checked.map((v, i) => i === idx ? !v : v))}
              />
              <span className={"routine-task-label" + (routineChecked[idx] ? " strike" : "")}>{task}</span>
            </div>
          )) : null}
        </div>
        {/* כפתור "מאחורי הקלעים" */}
        <div style={{ marginTop: 24, padding: '0 16px' }}>
          <button
            onClick={() => setShowBackstageView(true)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#8D7350',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#6B5B47'}
            onMouseLeave={(e) => e.target.style.background = '#8D7350'}
          >
            מאחורי הקלעים
          </button>
        </div>
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
        {/* שורת חיפוש תיקים */}
        <div className="search-bar" style={{ width: '100%', background: 'none', padding: '0 0 10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש תיק לפי שם..."
            dir="rtl"
            style={{ flex: 1, maxWidth: 420, fontSize: 17, padding: '7px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#fff', textAlign: 'right' }}
            className="text-right"
          />
        </div>
        {/* לשונית יצירת תיק חדש */}
        <div className="add-patient-bar" style={{ width: '100%', background: '#f7f7f7', padding: '12px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid #e0e0e0', marginBottom: 24 }}>
          <form
            className="add-patient-form"
            dir="rtl"
            onSubmit={e => {
              e.preventDefault();
              if (!form.identifier.trim()) return;
              if (patientsList.some(p => p.identifier === form.identifier.trim())) return;
              const newPatient = {
                identifier: form.identifier.trim(),
                selectedTasks: [],
                taskSubtasks: {},
                collapsed: {},
                population: ""
              };
              setPatientsList((prev) => [...prev, newPatient]);
              setForm({ identifier: "" });
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 420 }}
          >
            <input
              name="identifier"
              value={form.identifier}
              onChange={handleFormChange}
              required
              placeholder="הוסף תיק חדש (לדוג' ת.ש 658)"
              dir="rtl"
              className="text-right"
              style={{ flex: 1, fontSize: 17, padding: '7px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#fff', textAlign: 'right' }}
            />
            <button type="submit" style={{ fontWeight: 'bold', fontSize: 15, padding: '7px 16px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none' }}>הוסף</button>
          </form>
        </div>
        {/* ניהול התיק הפתוח */}
        <div style={{ flex: 1, width: '100%' }}>
          {showBackstageView ? (
            <div className="backstage-view text-right" dir="rtl" style={{ padding: '24px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, color: '#8D7350', fontSize: 28 }}>מאחורי הקלעים</h2>
                <div style={{ display: 'flex', gap: 8 }}>
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
              
              {/* רשימת המשימות (tasks) */}
              <div style={{ marginBottom: 40 }}>
                <h3 style={{ color: '#8D7350', fontSize: 22, marginBottom: 20, borderBottom: '2px solid #CBB994', paddingBottom: 8 }}>
                  רשימת המשימות
                </h3>
                <div style={{ padding: '0 16px' }}>
                  {allTasks.map((task, index) => (
                    <div key={task.title} style={{ marginBottom: 24 }}>
                      <h4 style={{ 
                        color: '#4E342E', 
                        fontSize: 18, 
                        fontWeight: 'bold', 
                        margin: '0 0 12px 0',
                        padding: '8px 0',
                        borderBottom: '1px solid #E0E0E0'
                      }}>
                        {index + 1}. {task.title}
                      </h4>
                      {task.subtasks && task.subtasks.length > 0 ? (
                        <ul style={{ 
                          margin: '0 0 0 24px', 
                          padding: 0,
                          listStyle: 'none'
                        }}>
                          {task.subtasks.map((subtask, subIndex) => (
                            <li key={subIndex} style={{ 
                              marginBottom: 8,
                              padding: '4px 0',
                              fontSize: 15,
                              color: '#666',
                              position: 'relative'
                            }}>
                              <span style={{ 
                                position: 'absolute',
                                right: '-20px',
                                top: '4px',
                                color: '#8D7350',
                                fontSize: 12,
                                fontWeight: 'bold'
                              }}>
                                {subIndex + 1}.
                              </span>
                              {subtask}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ 
                          margin: '0 0 0 24px', 
                          color: '#888', 
                          fontSize: 14,
                          fontStyle: 'italic'
                        }}>
                          אין תתי-משימות למשימה זו
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* משימות שוטפות */}
              <div style={{ marginBottom: 40 }}>
                <h3 style={{ color: '#8D7350', fontSize: 22, marginBottom: 20, borderBottom: '2px solid #CBB994', paddingBottom: 8 }}>
                  משימות שוטפות
                </h3>
                <div style={{ padding: '0 16px' }}>
                  <ul style={{ 
                    margin: 0, 
                    padding: 0,
                    listStyle: 'none'
                  }}>
                    {appData ? appData.routineTasks.map((task, index) => (
                      <li key={index} style={{ 
                        marginBottom: 12,
                        padding: '8px 0',
                        fontSize: 16,
                        color: '#4E342E',
                        borderBottom: '1px solid #F0F0F0'
                      }}>
                        <span style={{ 
                          color: '#8D7350',
                          fontWeight: 'bold',
                          marginLeft: 8
                        }}>
                          {index + 1}.
                        </span>
                        {task}
                      </li>
                    )) : null}
                  </ul>
                </div>
              </div>

              {/* עץ ההחלטות */}
              <div style={{ marginBottom: 40 }}>
                <h3 style={{ color: '#8D7350', fontSize: 22, marginBottom: 20, borderBottom: '2px solid #CBB994', paddingBottom: 8 }}>
                  עץ ההחלטות – הפניה ליועץ חיצוני
                </h3>
                <div style={{ padding: '0 16px' }}>
                  <div style={{ 
                    background: '#F9F6F1', 
                    border: '1px solid #CBB994', 
                    borderRadius: 8, 
                    padding: 20,
                    marginBottom: 16
                  }}>
                    <h4 style={{ 
                      color: '#8D7350', 
                      fontSize: 18, 
                      fontWeight: 'bold', 
                      margin: '0 0 16px 0',
                      textAlign: 'center'
                    }}>
                      זרימת ההחלטות המלאה
                    </h4>
                    
                    <div style={{ direction: 'rtl', textAlign: 'right' }}>
                      <div style={{ 
                        background: '#F7F3E9', 
                        border: '1px solid #CBB994', 
                        borderRadius: 6, 
                        padding: 16,
                        marginBottom: 16
                      }}>
                        <h5 style={{ 
                          color: '#8D7350', 
                          fontSize: 16, 
                          fontWeight: 'bold', 
                          margin: '0 0 12px 0',
                          borderBottom: '1px solid #CBB994',
                          paddingBottom: 8
                        }}>
                          שלב 1: מהו שיוך הפונה?
                        </h5>
                        
                        <div style={{ marginRight: 16 }}>
                          {/* כלל (30 טיפולים) */}
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ 
                              background: '#E6D97A', 
                              padding: '8px 12px', 
                              borderRadius: 4, 
                              border: '1px solid #CBB994',
                              marginBottom: 8
                            }}>
                              <span style={{ fontWeight: 'bold', color: '#8D7350' }}>כלל (30 טיפולים)</span>
                            </div>
                            <div style={{ marginRight: 20 }}>
                              <div style={{ 
                                background: '#F5EEDC', 
                                padding: '6px 10px', 
                                borderRadius: 4, 
                                border: '1px solid #CBB994',
                                marginBottom: 6
                              }}>
                                <span style={{ fontWeight: 'bold', color: '#8D7350' }}>שלב 2: מה סוג ההפניה?</span>
                              </div>
                              <div style={{ marginRight: 16 }}>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הפניה חדשה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הפניה חדשה"</span></div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• השלמת סל → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "השלמת סל ראשונה"</span></div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הארכה חריגה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הארכה חריגה"</span></div>
                              </div>
                            </div>
                          </div>

                          {/* כלל (משבר חריף – 45 טיפולים) */}
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ 
                              background: '#E6D97A', 
                              padding: '8px 12px', 
                              borderRadius: 4, 
                              border: '1px solid #CBB994',
                              marginBottom: 8
                            }}>
                              <span style={{ fontWeight: 'bold', color: '#8D7350' }}>כלל (משבר חריף – 45 טיפולים)</span>
                            </div>
                            <div style={{ marginRight: 20 }}>
                              <div style={{ 
                                background: '#F5EEDC', 
                                padding: '6px 10px', 
                                borderRadius: 4, 
                                border: '1px solid #CBB994',
                                marginBottom: 6
                              }}>
                                <span style={{ fontWeight: 'bold', color: '#8D7350' }}>שלב 2: מה סוג ההפניה?</span>
                              </div>
                              <div style={{ marginRight: 16 }}>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הפניה חדשה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הפניה חדשה"</span></div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>
                                  • השלמת סל
                                  <div style={{ marginRight: 16, marginTop: 4 }}>
                                    <div style={{ 
                                      background: '#A3B18A', 
                                      padding: '4px 8px', 
                                      borderRadius: 4, 
                                      border: '1px solid #CBB994',
                                      marginBottom: 4
                                    }}>
                                      <span style={{ fontWeight: 'bold', color: '#8D7350' }}>שלב 3: האם עברו 30 טיפולים?</span>
                                    </div>
                                    <div style={{ marginRight: 12 }}>
                                      <div style={{ marginBottom: 2, color: '#4E342E' }}>  - כן → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "השלמת סל שניה ומעלה"</span></div>
                                      <div style={{ marginBottom: 2, color: '#4E342E' }}>  - לא → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "השלמת סל ראשונה"</span></div>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הארכה חריגה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הארכה חריגה"</span></div>
                              </div>
                            </div>
                          </div>

                          {/* כלל (פסיכופתולוגיה – 60 טיפולים) */}
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ 
                              background: '#E6D97A', 
                              padding: '8px 12px', 
                              borderRadius: 4, 
                              border: '1px solid #CBB994',
                              marginBottom: 8
                            }}>
                              <span style={{ fontWeight: 'bold', color: '#8D7350' }}>כלל (פסיכופתולוגיה – 60 טיפולים)</span>
                            </div>
                            <div style={{ marginRight: 20 }}>
                              <div style={{ 
                                background: '#F5EEDC', 
                                padding: '6px 10px', 
                                borderRadius: 4, 
                                border: '1px solid #CBB994',
                                marginBottom: 6
                              }}>
                                <span style={{ fontWeight: 'bold', color: '#8D7350' }}>שלב 2: מה סוג ההפניה?</span>
                              </div>
                              <div style={{ marginRight: 16 }}>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הפניה חדשה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הפניה חדשה"</span></div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• השלמת סל → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "השלמת סל ראשונה"</span></div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הארכה חריגה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הארכה חריגה"</span></div>
                              </div>
                            </div>
                          </div>

                          {/* כלל (חרבות ברזל – 45 טיפולים) */}
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ 
                              background: '#E6D97A', 
                              padding: '8px 12px', 
                              borderRadius: 4, 
                              border: '1px solid #CBB994',
                              marginBottom: 8
                            }}>
                              <span style={{ fontWeight: 'bold', color: '#8D7350' }}>כלל (חרבות ברזל – 45 טיפולים)</span>
                            </div>
                            <div style={{ marginRight: 20 }}>
                              <div style={{ 
                                background: '#F5EEDC', 
                                padding: '6px 10px', 
                                borderRadius: 4, 
                                border: '1px solid #CBB994',
                                marginBottom: 6
                              }}>
                                <span style={{ fontWeight: 'bold', color: '#8D7350' }}>שלב 2: מה סוג ההפניה?</span>
                              </div>
                              <div style={{ marginRight: 16 }}>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הפניה חדשה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הפניה חדשה"</span></div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• השלמת סל → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "השלמת סל ראשונה"</span></div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הארכה חריגה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הארכה חריגה"</span></div>
                              </div>
                            </div>
                          </div>

                          {/* קצין לוחם */}
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ 
                              background: '#E6D97A', 
                              padding: '8px 12px', 
                              borderRadius: 4, 
                              border: '1px solid #CBB994',
                              marginBottom: 8
                            }}>
                              <span style={{ fontWeight: 'bold', color: '#8D7350' }}>קצין לוחם (45 טיפולים / רעיה – 12 / רס"ן ומעלה – 60)</span>
                            </div>
                            <div style={{ marginRight: 20 }}>
                              <div style={{ 
                                background: '#F5EEDC', 
                                padding: '6px 10px', 
                                borderRadius: 4, 
                                border: '1px solid #CBB994',
                                marginBottom: 6
                              }}>
                                <span style={{ fontWeight: 'bold', color: '#8D7350' }}>שלב 2: מה סוג ההפניה?</span>
                              </div>
                              <div style={{ marginRight: 16 }}>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>
                                  • הפניה חדשה
                                  <div style={{ marginRight: 16, marginTop: 4 }}>
                                    <div style={{ 
                                      background: '#A3B18A', 
                                      padding: '4px 8px', 
                                      borderRadius: 4, 
                                      border: '1px solid #CBB994',
                                      marginBottom: 4
                                    }}>
                                      <span style={{ fontWeight: 'bold', color: '#8D7350' }}>שלב 3: האם מדובר בטיפול לרעיה?</span>
                                    </div>
                                    <div style={{ marginRight: 12 }}>
                                      <div style={{ marginBottom: 2, color: '#4E342E' }}>  - כן → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "שיבוץ לפמי"</span></div>
                                      <div style={{ marginBottom: 2, color: '#4E342E' }}>  - לא → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הפניה חדשה"</span></div>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• השלמת סל → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "השלמת סל ראשונה"</span></div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הארכה חריגה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הארכה חריגה"</span></div>
                              </div>
                            </div>
                          </div>

                          {/* מפקד לוחם */}
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ 
                              background: '#E6D97A', 
                              padding: '8px 12px', 
                              borderRadius: 4, 
                              border: '1px solid #CBB994',
                              marginBottom: 8
                            }}>
                              <span style={{ fontWeight: 'bold', color: '#8D7350' }}>מפקד לוחם (עד רס"ן – 60 / סא"ל ומעלה – 90)</span>
                            </div>
                            <div style={{ marginRight: 20 }}>
                              <div style={{ 
                                background: '#F5EEDC', 
                                padding: '6px 10px', 
                                borderRadius: 4, 
                                border: '1px solid #CBB994',
                                marginBottom: 6
                              }}>
                                <span style={{ fontWeight: 'bold', color: '#8D7350' }}>שלב 2: מה סוג ההפניה?</span>
                              </div>
                              <div style={{ marginRight: 16 }}>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הפניה חדשה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הפניה חדשה"</span></div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• השלמת סל → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "השלמת סל ראשונה"</span></div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הארכה חריגה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הארכה חריגה"</span></div>
                              </div>
                            </div>
                          </div>

                          {/* צמי"ד */}
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ 
                              background: '#E6D97A', 
                              padding: '8px 12px', 
                              borderRadius: 4, 
                              border: '1px solid #CBB994',
                              marginBottom: 8
                            }}>
                              <span style={{ fontWeight: 'bold', color: '#8D7350' }}>צמי"ד (60 טיפולים)</span>
                            </div>
                            <div style={{ marginRight: 20 }}>
                              <div style={{ 
                                background: '#F5EEDC', 
                                padding: '6px 10px', 
                                borderRadius: 4, 
                                border: '1px solid #CBB994',
                                marginBottom: 6
                              }}>
                                <span style={{ fontWeight: 'bold', color: '#8D7350' }}>שלב 2: מה סוג ההפניה?</span>
                              </div>
                              <div style={{ marginRight: 16 }}>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הפניה חדשה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הפניה חדשה"</span></div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• השלמת סל → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "השלמת סל ראשונה"</span></div>
                                <div style={{ marginBottom: 4, color: '#4E342E' }}>• הארכה חריגה → <span style={{ color: '#8D7350', fontWeight: 'bold' }}>משימה סופית: "הארכה חריגה"</span></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : patient ? (
            <div className="patient-card text-right" dir="rtl">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ margin: 0 }} className="text-right">
                    {patient.identifier}
                  </h2>
                {patient.population && (
                    <div className="patient-affiliation" style={{ fontSize: 14, color: '#888', opacity: 0.8, marginRight: 8, marginTop: 2 }}>{patient.population}</div>
                )}
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 2, padding: 0 }}>
                  <CircleProgress percent={patient.percent || 0} size={CIRCLE_SIZE} className="circle-progress-main" />
                </div>
              </div>
              {/* סטטוס ארכיון + כפתורים */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                {archivedPatients.some(p => p.identifier === patient.identifier) ? (
                  <>
                    <span style={{ color: '#c62828', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}><FaArchive /> תיק בארכיון</span>
                    <button onClick={() => unarchivePatient(patient.identifier)} style={{ background: '#e3f2fd', color: '#1976d2', border: '1px solid #90caf9', borderRadius: 6, padding: '6px 12px', fontWeight: 'bold' }}>החזר לטיפול</button>
                    <button onClick={() => { deletePatient(patient.identifier, true); setPatient(null); }} style={{ background: '#fff0f0', color: '#c62828', border: '1px solid #e57373', borderRadius: 6, padding: '6px 12px', fontWeight: 'bold' }}>מחק לצמיתות</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#8D7350', fontWeight: 'bold' }}>תיק פעיל</span>
                    <button onClick={() => { archivePatient(patient.identifier); setPatient(null); }} style={{ background: '#F7F3E9', color: '#8D7350', border: '1px solid #CBB994', borderRadius: 6, padding: '6px 12px', fontWeight: 'bold' }}>העבר לארכיון</button>
                    <button onClick={() => { deletePatient(patient.identifier, false); setPatient(null); }} style={{ background: '#fff0f0', color: '#c62828', border: '1px solid #e57373', borderRadius: 6, padding: '6px 12px', fontWeight: 'bold' }}>מחק לצמיתות</button>
                  </>
                )}
              </div>
              <div className="tasks-list text-right" dir="rtl">
                <h3 className="text-right">בחר משימות לתיק:</h3>
                {(() => {
                  const intake = allTasks.find(t => t.title === "אינטייק ראשוני");
                  const external = allTasks.find(t => t.title === "הפניה ליועץ חיצוני");
                  const rest = allTasks.filter(t => t.title !== "אינטייק ראשוני" && t.title !== "הפניה ליועץ חיצוני" && !decisionSubtasks.includes(t.title));
                  const ordered = [intake, external, ...rest].filter(Boolean);
                  return ordered.map((task) => (
                    <React.Fragment key={task.title}>
                      <div style={{ marginBottom: '0.5em' }} dir="rtl">
                        {task.title === "הפניה ליועץ חיצוני" ? (
                          <span
                            style={{ fontWeight: 'bold', cursor: 'pointer', display: 'inline-block', padding: '2px 0', color: '#8D7350' }}
                            className="external-ref-label text-right"
                            onClick={() => setShowDynamicQuestions(true)}
                            tabIndex={0}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowDynamicQuestions(true); }}
                            role="button"
                            aria-label="הפניה ליועץ חיצוני"
                          >
                            {task.title}
                          </span>
                        ) : (
                          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold', gap: 8 }} className="text-right">
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task.title)}
                              onChange={e => handleTaskCheckbox(task, e.target.checked)}
                              style={{ marginLeft: 0, marginRight: 8 }}
                            />
                            {task.title}
                          </label>
                        )}
                      </div>
                      {task.title === "הפניה ליועץ חיצוני" && decisionSubtasks.map(subTaskTitle => {
                        const subTaskObj = allTasks.find(t => t.title === subTaskTitle);
                        return (
                          <div key={subTaskTitle} style={{ marginRight: 32, marginBottom: '0.5em', direction: 'rtl', textAlign: 'right' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal' }} className="text-right">
                              <input
                                type="checkbox"
                                checked={selectedTasks.includes(subTaskTitle)}
                                onChange={e => handleTaskCheckbox(subTaskObj, e.target.checked)}
                                style={{ marginLeft: 0, marginRight: 8 }}
                              />
                              {subTaskTitle}
                            </label>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ));
                })()}
              </div>
              {showDynamicQuestions && (
                <DynamicQuestions decisionTree={appData ? appData.decisionTree : null} onFinish={val => handleDynamicFinish(val.finalTask, val.population)} />
              )}
              {selectedTasks.length > 0 && (
                <div className="added-tasks text-right" dir="rtl">
                  <h3 style={{ marginTop: '2em' }} className="text-right">משימות בתיק:</h3>
                  {selectedTasks.length > 0 && selectedTasks.filter(taskTitle => taskTitle !== "הפניה ליועץ חיצוני").map((taskTitle) => {
                    const task = allTasks.find((t) => t.title === taskTitle);
                    if (!task) return null;
                    const isCollapsed = collapsed[task.title];
                    const allChecked = taskSubtasks[task.title]?.length > 0 && taskSubtasks[task.title].every(Boolean);
                    return (
                      <div key={task.title} className="added-task-block text-right" dir="rtl">
                        <div
                          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none', justifyContent: 'space-between' }}
                          onClick={() => toggleCollapse(task.title)}
                          className="text-right"
                          dir="rtl"
                        >
                          <span style={{ fontSize: 18, color: '#8D7350', marginLeft: 8 }}>{isCollapsed ? '▶' : '▼'}</span>
                          <span style={{ fontWeight: 'bold', flexGrow: 1, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 15 }}>{task.title}</span>
                          <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={e => {
                              const checked = e.target.checked;
                              setTaskSubtasks(prev => {
                                const newArr = prev[task.title]?.map(() => checked) || [];
                                setCollapsed(prevCollapsed => ({
                                  ...prevCollapsed,
                                  [task.title]: checked
                                }));
                                // הוספת קריאה ל-updatePatientTasks
                                const newTaskSubtasks = {
                                  ...prev,
                                  [task.title]: newArr
                                };
                                updatePatientTasks({ taskSubtasks: newTaskSubtasks, collapsed: { ...collapsed, [task.title]: checked } });
                                return newTaskSubtasks;
                              });
                            }}
                            style={{ accentColor: '#8D7350', marginLeft: 0, marginRight: 8 }}
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                        {!isCollapsed && (
                          <ul className="subtasks text-right" dir="rtl">
                            {task.subtasks.map((st, i) => (
                              <li key={i} style={{ listStyle: 'none', marginRight: 0 }} className="text-right" dir="rtl">
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} className="text-right">
                                  <input
                                    type="checkbox"
                                    checked={taskSubtasks[task.title]?.[i] || false}
                                    onChange={e => handleSubtaskCheckbox(task.title, i, e)}
                                    style={{ marginLeft: 0, marginRight: 8 }}
                                    onClick={e => e.stopPropagation()}
                                  />
                                  <span className={taskSubtasks[task.title]?.[i] ? 'strike' : ''}>{st}</span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#888', marginTop: 80, fontSize: 22, textAlign: 'center', width: '100%', minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1.5 }}>
              {idleQuotes[idleQuoteIdx]}
            </div>
          )}
        </div>
      </div>
      {/* פס גרירה שמאלי */}
      <div
        className="resize-handle left"
        style={{ cursor: 'ew-resize', width: 8, background: dragging === 'left' ? '#90caf9' : 'transparent', zIndex: 10 }}
        onMouseDown={e => { setDragging('left'); setStartX(e.clientX); setStartWidth(leftPanelWidth); }}
        onTouchStart={e => { setDragging('left'); setStartX(e.touches[0].clientX); setStartWidth(leftPanelWidth); }}
      />
      {/* פאנל שמאל */}
      <div
        className="patients-list-panel"
        style={{ width: leftPanelWidth, minWidth: 120, maxWidth: 400, transition: dragging === 'left' ? 'none' : 'width 0.15s', direction: 'rtl' }}
      >
        {/* כותרת תיקים בטיפול עם כפתור ניהול */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 0 }}>
          <h3 style={{ fontWeight: 'bold', margin: 0 }}>תיקים בטיפול</h3>
          <button
            onClick={archiveAllPatients}
            disabled={patientsList.length === 0}
            style={{ fontSize: 14, padding: '6px 8px', borderRadius: 6, background: '#F7F3E9', border: '1px solid #CBB994', color: '#8D7350', fontWeight: 'bold', cursor: patientsList.length === 0 ? 'not-allowed' : 'pointer', marginRight: 4 }}
          >
            העבר את כל התיקים לארכיון
          </button>
        </div>
        {(() => {
          // חישוב מספר עמודות דינמי כך שלא תהיה חפיפה/חיתוך (כולל gap)
          const gap = 16;
          let colCount = 5;
          while (colCount > 1 && ((colCount * 64) + ((colCount - 1) * gap) > leftPanelWidth)) {
            colCount--;
          }
          // אם יש מקום לעוד עמודה שלמה (כולל gap), נוסיף
          while (
            (colCount < 5) &&
            (((colCount + 1) * 64) + (colCount * gap) <= leftPanelWidth)
          ) {
            colCount++;
          }
          return (
            <div
              className="patients-list-grid text-right"
              dir="rtl"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${colCount}, 1fr)`,
                gap: 16,
                direction: 'rtl',
                textAlign: 'right',
              }}
            >
              {filteredPatients.length === 0 ? (
                <div style={{ color: '#888', fontSize: 15, gridColumn: `span ${colCount}`, textAlign: 'center', alignSelf: 'center', justifySelf: 'center', marginTop: 32 }}>
                  הכל רגוע, אה?
                </div>
              ) : (
                filteredPatients.map((p) => {
                  const isMatch = matchedIds.includes(p.identifier);
                  return (
                    <div
                      key={p.identifier}
                      className={`patient-card-mini card${archivedPatients.some(ap => ap.identifier === p.identifier) ? ' archived' : ''}${patient && patient.identifier === p.identifier ? ' selected' : ''}`}
                      style={{
                        border: '1.5px solid #ccc',
                        borderRadius: 16,
                        padding: '32px 18px 36px 18px',
                        minWidth: 0,
                        cursor: 'pointer',
                        background: archivedPatients.some(ap => ap.identifier === p.identifier)
                          ? '#fff6e0'
                          : (isMatch ? '#F7F3E9' : (patient && patient.identifier === p.identifier ? '#ffe0b2' : '#fffbea')),
                        direction: 'rtl',
                        textAlign: 'right',
                        transition: 'background 0.2s',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        gap: 4,
                        width: 64,
                        height: 100,
                        boxSizing: 'border-box',
                        justifyContent: 'flex-start',
                        overflow: 'hidden',
                      }}
                      onClick={() => openPatient(p)}
                    >
                      {/* שלוש נקודות תפריט */}
                      <div className="three-dots" style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, cursor: 'pointer', color: '#8D7350' }} title="אפשרויות" onClick={e => { e.stopPropagation(); setMenuOpenIdx(p.identifier + (archivedPatients.some(ap => ap.identifier === p.identifier) ? '-arch' : '')); }}>
                        <span style={{ fontSize: 22, color: '#8D7350', userSelect: 'none' }}>&#x22EE;</span>
                      </div>
                      {/* כותרת ושיוך */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 8, marginBottom: 8, paddingRight: 4 }}>
                        <div className="card-title-ellipsis" style={{ fontWeight: 'bold', fontSize: 20, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, padding: 0, lineHeight: 1.15 }}>
                          {p.identifier}
                      </div>
                      {p.population && (
                          <div className="patient-affiliation" style={{ fontSize: 15, color: '#333', opacity: 0.9, marginTop: 2, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.population}</div>
                        )}
                        </div>
                      {/* עיגול אחוזים */}
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '12px 0 0 0', minHeight: 64 }}>
                        <CircleProgress percent={p.percent || 0} size={64} className="circle-progress-main" />
                      </div>
                      {/* תפריט אפשרויות */}
                      {menuOpenIdx === p.identifier + (archivedPatients.some(ap => ap.identifier === p.identifier) ? '-arch' : '') && (
                        <div ref={menuRef} style={{ position: 'absolute', top: 32, left: 8, background: '#fff', border: '1px solid #ccc', borderRadius: 8, boxShadow: '0 2px 8px #eee', zIndex: 100, minWidth: 110 }}>
                          {archivedPatients.some(ap => ap.identifier === p.identifier) ? (
                            <>
                              <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }} onClick={e => { e.stopPropagation(); unarchivePatient(p.identifier); setMenuOpenIdx(null); }}>החזרה לטיפול</div>
                              <div style={{ padding: '8px 12px', cursor: 'pointer', color: 'red' }} onClick={e => { e.stopPropagation(); deletePatient(p.identifier, true); setMenuOpenIdx(null); }}>מחיקה</div>
                            </>
                          ) : (
                            <>
                          <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }} onClick={e => { e.stopPropagation(); archivePatient(p.identifier); setMenuOpenIdx(null); }}>העברה לארכיון</div>
                          <div style={{ padding: '8px 12px', cursor: 'pointer', color: 'red' }} onClick={e => { e.stopPropagation(); deletePatient(p.identifier, false); setMenuOpenIdx(null); }}>מחיקה</div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })()}
        <div style={{ marginTop: 24 }}>
          <div
            style={{ fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', color: '#8D7350', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setArchiveOpen(o => !o)}
          >
            <span style={{ color: '#8D7350' }}>{archiveOpen ? '▼' : '►'}</span> ארכיון
            {/* כפתורי ניהול ארכיון */}
            <button
              onClick={unarchiveAllPatients}
              disabled={archivedPatients.length === 0}
              style={{ fontSize: 14, padding: '6px 8px', borderRadius: 6, background: '#f7f7f7', border: '1px solid #bbb', color: '#333', fontWeight: 'bold', cursor: archivedPatients.length === 0 ? 'not-allowed' : 'pointer', marginRight: 8 }}
            >
              הוצא את כל התיקים מהארכיון
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={archivedPatients.length === 0}
              style={{ fontSize: 14, padding: '6px 8px', borderRadius: 6, background: '#fff0f0', border: '1px solid #e57373', color: '#c62828', fontWeight: 'bold', cursor: archivedPatients.length === 0 ? 'not-allowed' : 'pointer', marginRight: 4 }}
            >
              מחק לצמיתות את כל התיקים שבארכיון
            </button>
          </div>
          {archiveOpen && (
            <div className="archived-list-grid" style={{ marginTop: 10 }}>
              {archivedPatients.length === 0 && <div style={{ color: '#888', fontSize: 15 }}>אין תיקים בארכיון</div>}
              {archivedPatients.map((p) => {
                const isSelected = patient && patient.identifier === p.identifier;
                const isMatch = archivedMatchedIds.includes(p.identifier);
                return (
                  <div
                    key={p.identifier}
                    className={`patient-card-mini card archived${isSelected ? ' selected' : ''}`}
                    style={{
                      background: isSelected ? '#ffe0b2' : (isMatch ? '#F7F3E9' : undefined),
                      width: 64,
                      minWidth: 0,
                      height: 100,
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      direction: 'rtl',
                      textAlign: 'right',
                      transition: 'background 0.2s',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 4,
                      justifyContent: 'flex-start',
                      paddingBottom: 36,
                    }}
                    onClick={() => openPatient(p)}
                  >
                    <div className="card-header-row" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2, direction: 'rtl', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: 36 }}>
                        <div className="card-title-ellipsis" style={{ fontWeight: 'bold', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: Math.max(12, Math.min(15, Math.floor(64 / 7))), lineHeight: 1.15, margin: 0, padding: 0, minHeight: 16, maxHeight: 32 }}>
                          {p.identifier}
                        </div>
                      {p.population && (
                        <div className="patient-affiliation">{p.population}</div>
                      )}
                      </div>
                    </div>
                    <div className="archive-under-circle" style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
                      <CircleProgress percent={p.percent || 0} size={CIRCLE_SIZE - 24} className="circle-progress-main" />
                      <span className="archive-icon" title="תיק בארכיון"><FaArchive /></span>
                    </div>
                    {menuOpenIdx === p.identifier + '-arch' && (
                      <div ref={menuRef} style={{ position: 'absolute', top: 32, left: 8, background: '#fff', border: '1px solid #ccc', borderRadius: 8, boxShadow: '0 2px 8px #eee', zIndex: 100, minWidth: 110 }}>
                        <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }} onClick={e => { e.stopPropagation(); unarchivePatient(p.identifier); setMenuOpenIdx(null); }}>החזרה לטיפול</div>
                        <div style={{ padding: '8px 12px', cursor: 'pointer', color: 'red' }} onClick={e => { e.stopPropagation(); deletePatient(p.identifier, true); setMenuOpenIdx(null); }}>מחיקה</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* מודאל אישור מחיקה */}
        {showDeleteModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: 28, minWidth: 260, boxShadow: '0 2px 16px #0002', textAlign: 'center', direction: 'rtl' }}>
              <div style={{ fontSize: 17, marginBottom: 18, color: '#c62828', fontWeight: 'bold' }}>
                האם אתה בטוח שברצונך למחוק את כל התיקים שבארכיון? <br />פעולה זו אינה ניתנת לשחזור.
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={deleteAllArchived} style={{ background: '#c62828', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 'bold', fontSize: 15 }}>מחק</button>
                <button onClick={() => setShowDeleteModal(false)} style={{ background: '#f7f7f7', color: '#333', border: '1px solid #bbb', borderRadius: 6, padding: '7px 18px', fontWeight: 'bold', fontSize: 15 }}>ביטול</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
