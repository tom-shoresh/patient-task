import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaQuestionCircle, FaTasks } from 'react-icons/fa';

// קומפוננטה רקורסיבית להצגת עץ ההחלטות כרשימה מקוננת
function NestedListNode({ node, onEdit, onAdd, onDelete, onAddQuestion, onEditFinalTask, mainTasks, parentPath = [], isRoot = false }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(node.question || node.name || '');
  const [editingFinalTask, setEditingFinalTask] = useState(false);
  const [addingFinalTask, setAddingFinalTask] = useState(false);
  const isQuestion = !!node.question;
  const isFinalAnswer = !isQuestion && !node.nextQuestion; // תשובה סופית - אין לה nextQuestion
  
  // תיקון בניית ה-path - לא להשתמש ב-node.name כחלק מה-path
  const path = [...parentPath];

  const handleEdit = () => {
    if (editing) {
      console.log('🔧 עריכת טקסט - path:', path, 'ערך חדש:', value);
      onEdit(path, value);
    }
    setEditing(!editing);
  };

  const handleEditFinalTask = (e) => {
    console.log('🔧 עריכת משימה סופית - path:', path, 'משימה חדשה:', e.target.value);
    onEditFinalTask(path, e.target.value);
    setEditingFinalTask(false);
  };

  const handleAddFinalTask = (e) => {
    console.log('🔧 הוספת משימה סופית - path:', path, 'משימה חדשה:', e.target.value);
    onEditFinalTask(path, e.target.value);
    setAddingFinalTask(false);
  };

  return (
    <li style={{ marginBottom: 6, position: 'relative', paddingRight: 4 }}>
      <span style={{ fontWeight: isQuestion ? 'bold' : 'normal', fontSize: isQuestion ? 16 : 15 }}>
        {editing ? (
      <input
            value={value}
            onChange={e => setValue(e.target.value)}
            style={{ fontSize: 15, padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', marginLeft: 6 }}
            autoFocus
          />
        ) : value}
      </span>
      <span style={{ marginRight: 8, display: 'inline-flex', gap: 4 }}>
        <button onClick={handleEdit} title={editing ? 'שמור' : 'ערוך'} style={{ fontSize: 16, marginLeft: 2, background: 'none', border: 'none', cursor: 'pointer' }}>
          <FaEdit />
        </button>
        {/* כפתור מחיקה לכל צומת */}
        <button onClick={() => onDelete(path, node)} title="מחק" style={{ fontSize: 16, color: '#c00', marginLeft: 2, background: 'none', border: 'none', cursor: 'pointer' }}>
          <FaTrash />
        </button>
        {isQuestion && (
          <button onClick={() => {
            console.log('➕ הוספת אפשרות - path:', path);
            onAdd(path);
          }} title="הוסף אפשרות" style={{ fontSize: 16, color: '#1976d2', marginLeft: 2, background: 'none', border: 'none', cursor: 'pointer' }}>
            <FaPlus />
          </button>
        )}
        {!isQuestion && (
          <button onClick={() => {
            console.log('❓ הוספת שאלה - path:', path);
            onAddQuestion(path);
          }} title="הוסף שאלה" style={{ fontSize: 16, color: '#8D7350', marginLeft: 2, background: 'none', border: 'none', cursor: 'pointer' }}>
            <FaQuestionCircle />
          </button>
        )}
      </span>
      {/* אפשרויות */}
      {isQuestion && node.options && node.options.length > 0 && (
        <ul style={{ listStyleType: 'circle', marginRight: 18, marginTop: 6 }}>
          {node.options.map((opt, idx) => (
            <NestedListNode
              key={idx}
              node={opt}
              onEdit={onEdit}
              onAdd={onAdd}
              onDelete={onDelete}
              onAddQuestion={onAddQuestion}
              onEditFinalTask={onEditFinalTask}
              mainTasks={mainTasks}
              parentPath={[...path, 'options', idx]}
            />
          ))}
        </ul>
      )}
      {/* תתי-שאלות */}
      {!isQuestion && node.nextQuestion && (
        <ul style={{ listStyleType: 'circle', marginRight: 18, marginTop: 6 }}>
          <NestedListNode
            node={node.nextQuestion}
            onEdit={onEdit}
            onAdd={onAdd}
            onDelete={onDelete}
            onAddQuestion={onAddQuestion}
            onEditFinalTask={onEditFinalTask}
            mainTasks={mainTasks}
            parentPath={[...path, 'nextQuestion']}
          />
        </ul>
      )}
      {/* משימות סופיות - קיימות */}
      {!isQuestion && node.finalTask && (
        <span style={{ marginRight: 8, color: '#8D7350', fontSize: 14 }}>
          {editingFinalTask ? (
            <select value={node.finalTask} onChange={handleEditFinalTask} style={{ fontSize: 14 }}>
              <option value="">בחר משימה...</option>
              {mainTasks.map((task, idx) => (
                <option key={idx} value={task.title}>{task.title}</option>
              ))}
            </select>
          ) : (
            <>
              → {node.finalTask}
              <button onClick={() => setEditingFinalTask(true)} title="ערוך משימה" style={{ fontSize: 16, marginRight: 6, background: 'none', border: 'none', cursor: 'pointer' }}>
                <FaTasks />
              </button>
              <button onClick={() => onEditFinalTask(path, '')} title="מחק משימה" style={{ fontSize: 16, marginRight: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#c00' }}>
                <FaTrash />
              </button>
            </>
          )}
        </span>
      )}
      {/* הוספת משימה לתשובה סופית - רק אם אין לה משימה ואין לה nextQuestion */}
      {isFinalAnswer && !node.finalTask && (
        <span style={{ marginRight: 8, color: '#8D7350', fontSize: 14 }}>
          {addingFinalTask ? (
            <select onChange={handleAddFinalTask} style={{ fontSize: 14 }}>
              <option value="">בחר משימה...</option>
              {mainTasks.map((task, idx) => (
                <option key={idx} value={task.title}>{task.title}</option>
              ))}
            </select>
          ) : (
            <button onClick={() => setAddingFinalTask(true)} title="הוסף משימה" style={{ fontSize: 16, marginRight: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#8D7350' }}>
              <FaTasks />
            </button>
          )}
        </span>
      )}
    </li>
  );
}

function updateTreeByPath(tree, path, updater) {
  console.log('🔄 updateTreeByPath - path:', path, 'tree type:', typeof tree, 'isArray:', Array.isArray(tree));
  
  if (path.length === 0) {
    console.log('✅ הגענו למיקום הסופי, מבצעים update');
    return updater(tree);
  }
  
  const [key, ...rest] = path;
  console.log('🔍 מטפלים במפתח:', key, 'שאר הנתיב:', rest);
  
  if (Array.isArray(tree)) {
    const idx = parseInt(key);
    console.log('📋 מעדכנים מערך באינדקס:', idx);
    return tree.map((item, i) => (i === idx ? updateTreeByPath(item, rest, updater) : item));
  } else if (typeof tree === 'object' && tree !== null) {
    // תיקון: תמיכה ב-finalTask
    if (key === 'options' || key === 'nextQuestion') {
      console.log('📁 מעדכנים שדה:', key);
      return { ...tree, [key]: updateTreeByPath(tree[key], rest, updater) };
    } else if (key === 'question' || key === 'name' || key === 'finalTask') {
      console.log('✏️ מעדכנים שדה טקסט:', key);
      return updater(tree);
    } else {
      console.log('⚠️ מפתח לא מוכר:', key, 'בעץ:', tree);
      return tree;
    }
  }
  
  console.log('⚠️ לא ניתן לטפל בנתיב:', path, 'עבור עץ:', tree);
  return tree;
}

const hasChildren = (node) => {
  console.log('🔍 hasChildren - node:', node);
  if (!node) return false;
  if (Array.isArray(node.options) && node.options.length > 0) {
    console.log('✅ יש options');
    return true;
  }
  if (node.nextQuestion) {
    console.log('✅ יש nextQuestion');
    return true;
  }
  if (node.finalTask) {
    console.log('✅ יש finalTask');
    return true;
  }
  // עבור השורש - בדוק אם יש תוכן כלשהו
  if (node.question || node.initialQuestion) {
    console.log('✅ יש question או initialQuestion');
    return true;
  }
  console.log('❌ אין בנים');
  return false;
};

function DeleteConfirmModal({ open, onConfirm, onCancel, message }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl'
    }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 280, boxShadow: '0 2px 12px #0002', textAlign: 'center' }}>
        <div style={{ fontSize: 18, marginBottom: 18 }}>{message}</div>
        <button onClick={onConfirm} style={{ background: '#c00', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', marginLeft: 8, fontSize: 16 }}>מחק</button>
        <button onClick={onCancel} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '6px 18px', fontSize: 16 }}>ביטול</button>
      </div>
    </div>
  );
}

const DecisionTreeEditor = ({ decisionTree, mainTasks, onUpdate }) => {
  if (!decisionTree || typeof decisionTree !== 'object') {
    return <div style={{color: '#c00', textAlign: 'center', margin: 30}}>שגיאה: עץ ההחלטה לא תקין או לא נטען</div>;
  }
  const [tree, setTree] = useState(decisionTree);
  const [initialQuestion, setInitialQuestion] = useState(decisionTree.initialQuestion || '');
  const [editingInitial, setEditingInitial] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, path: null, node: null, isRoot: false });

  // --- סנכרון state עם props ---
  useEffect(() => {
    console.log('🔄 סנכרון state עם props חדשים');
    setTree(decisionTree);
    setInitialQuestion(decisionTree.initialQuestion || '');
    setEditingInitial(false);
  }, [decisionTree]);

  const handleEdit = (path, newValue) => {
    console.log('📝 handleEdit - path:', path, 'ערך חדש:', newValue);
    
    // טיפול מיוחד בשאלה הראשית (path ריק)
    if (path.length === 0) {
      console.log('✅ מעדכן שאלה ראשית ל:', newValue);
      const newTree = { ...tree, initialQuestion: newValue };
      setTree(newTree);
      onUpdate && onUpdate(newTree);
      return;
    }
    
    // טיפול בשאר השאלות (path לא ריק)
    const newTree = updateTreeByPath(tree, path, (node) => {
      if (node.question !== undefined) {
        console.log('✅ מעדכן question ל:', newValue);
        return { ...node, question: newValue };
      }
      if (node.name !== undefined) {
        console.log('✅ מעדכן name ל:', newValue);
        return { ...node, name: newValue };
      }
      console.log('⚠️ לא נמצא שדה לעדכון ב-node:', node);
      return node;
    });
    console.log('🌳 עץ חדש:', newTree);
    setTree(newTree);
    onUpdate && onUpdate(newTree);
  };

  const handleAdd = (path) => {
    console.log('➕ handleAdd - path:', path);
    const newTree = updateTreeByPath(tree, path, (node) => {
      if (!node.options) node.options = [];
      const newOptions = [...node.options, { name: 'אפשרות חדשה' }];
      console.log('✅ הוספתי אפשרות חדשה, סה"כ אפשרויות:', newOptions.length);
      return { ...node, options: newOptions };
    });
    setTree(newTree);
    onUpdate && onUpdate(newTree);
  };

  const handleAddQuestion = (path) => {
    console.log('❓ handleAddQuestion - path:', path);
    const newTree = updateTreeByPath(tree, path, (node) => {
      const newNextQuestion = { question: 'שאלה חדשה', options: [] };
      console.log('✅ הוספתי שאלה חדשה:', newNextQuestion);
      return { ...node, nextQuestion: newNextQuestion };
    });
    setTree(newTree);
    onUpdate && onUpdate(newTree);
  };

  const handleDeleteRequest = (path, node, isRoot = false) => {
    console.log('🗑️ handleDeleteRequest - path:', path, 'node:', node, 'isRoot:', isRoot);
    // בדוק אם יש בנים
    if (hasChildren(node)) {
      console.log('⚠️ יש בנים - מציג אזהרה');
      setDeleteModal({ open: true, path, node, isRoot });
    } else {
      console.log('✅ אין בנים - מוחק מייד');
      handleDelete(path, isRoot);
    }
  };

  const handleDelete = (path, isRoot = false) => {
    setDeleteModal({ open: false, path: null, node: null, isRoot: false });
    if (isRoot) {
      // מחיקת השורש: נקה את כל העץ (למעט הכותרת)
      const newTree = { 
        ...tree, 
        initialQuestion: '', 
        options: []
        // לא נמחק את title כי הוא חשוב לזיהוי העץ
      };
      console.log('🗑️ מחיקת שורש - עץ חדש:', newTree);
      setTree(newTree);
      console.log('📤 קורא ל-onUpdate עם העץ החדש');
      onUpdate && onUpdate(newTree);
      return;
    }
    

    
    // מחיקת שאלה (nextQuestion) - מוחק את כל הסעיף כולל הבנים
    if (path.length > 0 && path[path.length - 1] === 'nextQuestion') {
      const parentPath = path.slice(0, -1);
      console.log('🗑️ מוחק שאלה וכל הבנים שלה מהנתיב:', parentPath);
      const newTree = updateTreeByPath(tree, parentPath, (node) => {
        const { nextQuestion, ...nodeWithoutNextQuestion } = node;
        console.log('✅ הסרתי nextQuestion וכל הבנים שלה');
        return nodeWithoutNextQuestion;
      });
      setTree(newTree);
      onUpdate && onUpdate(newTree);
      return;
    }
    
    // מחיקת אפשרות ממערך options
    if (path.length >= 2 && path[path.length - 2] === 'options') {
      const idx = parseInt(path[path.length - 1]);
      const parentPath = path.slice(0, -2);
      console.log('🗑️ מוחק אפשרות באינדקס:', idx, 'מהנתיב:', parentPath);
      const newTree = updateTreeByPath(tree, parentPath, (node) => {
        const filteredOptions = node.options.filter((_, i) => i !== idx);
        console.log('✅ הסרתי אפשרות, נשארו:', filteredOptions.length);
        return { ...node, options: filteredOptions };
      });
      setTree(newTree);
      onUpdate && onUpdate(newTree);
      return;
    }
    
    // מחיקת תשובה סופית (finalTask) - מוחק רק את המשימה הסופית
    if (path.length > 0 && path[path.length - 1] === 'finalTask') {
      const parentPath = path.slice(0, -1);
      console.log('🗑️ מוחק משימה סופית מהנתיב:', parentPath);
      const newTree = updateTreeByPath(tree, parentPath, (node) => {
        const { finalTask, ...nodeWithoutFinalTask } = node;
        console.log('✅ הסרתי finalTask');
        return nodeWithoutFinalTask;
      });
      setTree(newTree);
      onUpdate && onUpdate(newTree);
      return;
    }
    
    console.log('⚠️ לא ניתן לזהות סוג המחיקה עבור path:', path);
  };

  const handleEditFinalTask = (path, newFinalTask) => {
    console.log('🎯 handleEditFinalTask - path:', path, 'משימה חדשה:', newFinalTask);
    
    // אם הערך ריק, זה אומר שמחקו את המשימה
    if (!newFinalTask || newFinalTask.trim() === '') {
      console.log('🗑️ מוחק משימה סופית');
      const newTree = updateTreeByPath(tree, path, (node) => {
        const { finalTask, ...nodeWithoutFinalTask } = node;
        return nodeWithoutFinalTask;
      });
      setTree(newTree);
      onUpdate && onUpdate(newTree);
      return;
    }
    
    const newTree = updateTreeByPath(tree, path, (node) => {
      console.log('✅ מעדכן finalTask ל:', newFinalTask);
      return { ...node, finalTask: newFinalTask };
    });
    setTree(newTree);
    onUpdate && onUpdate(newTree);
  };

  const handleInitialEdit = () => {
    if (editingInitial) {
      // כאשר העריכה מסתיימת - שמור את השינוי
      const newTree = { ...tree, initialQuestion };
      console.log('handleInitialEdit: שולח עץ חדש ל-onUpdate:', newTree);
      setTree(newTree);
      onUpdate && onUpdate(newTree);
    } else {
      // כאשר מתחילים עריכה - סנכרן את ה-state עם ה-tree
      setInitialQuestion(tree.initialQuestion || '');
    }
    setEditingInitial(!editingInitial);
  };

  return (
    <div style={{ background: '#fafafa', borderRadius: 8, border: '1px solid #E0E0E0', padding: 16, fontFamily: 'inherit', direction: 'rtl' }}>
      <DeleteConfirmModal
        open={deleteModal.open}
        message={deleteModal.isRoot ? 'מחיקת השורש תמחק את כל העץ. האם להמשיך?' : 'לצומת זה יש בנים. האם למחוק אותו ואת כל תת-העץ?'}
        onConfirm={() => handleDelete(deleteModal.path, deleteModal.isRoot)}
        onCancel={() => setDeleteModal({ open: false, path: null, node: null, isRoot: false })}
      />
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontWeight: 'bold', fontSize: 20, color: '#8D7350' }}>
          {`עץ החלטות - ${decisionTree.title || ''}`}
        </span>
        {/* כפתור מחיקת שורש */}
        <button 
          onClick={() => {
            console.log('🗑️ לחיצה על כפתור מחיקת שורש');
            handleDeleteRequest([], { options: tree.options || [], initialQuestion: tree.initialQuestion }, true);
          }} 
          style={{ 
            float: 'left', 
            color: '#c00', 
            background: 'none', 
            border: 'none', 
            fontSize: 18, 
            cursor: 'pointer',
            marginLeft: 8,
            padding: '4px 8px',
            borderRadius: 4
          }} 
          title="מחק עץ"
        >
          <FaTrash /> מחק עץ
        </button>
      </div>
      <ul style={{ listStyleType: 'disc', paddingRight: 0, marginRight: 0 }}>
        <NestedListNode
          node={{ question: tree.initialQuestion, options: tree.options }}
          onEdit={handleEdit}
          onAdd={handleAdd}
          // העבר isRoot=true רק לשורש
          onDelete={(path, node) => handleDeleteRequest(path, node, path.length === 0)}
          onAddQuestion={handleAddQuestion}
          onEditFinalTask={handleEditFinalTask}
          mainTasks={mainTasks}
          parentPath={[]}
          isRoot={true}
        />
      </ul>
    </div>
  );
};

export default DecisionTreeEditor; 