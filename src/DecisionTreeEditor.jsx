import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaQuestionCircle, FaTasks } from 'react-icons/fa';

// קומפוננטה רקורסיבית להצגת עץ ההחלטות כרשימה מקוננת
function NestedListNode({ node, onEdit, onAdd, onDelete, onAddQuestion, onEditFinalTask, mainTasks, parentPath = [] }) {
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
        {!isQuestion && (
          <button onClick={() => {
            console.log('🗑️ מחיקת אפשרות - path:', path);
            onDelete(path);
          }} title="מחק" style={{ fontSize: 16, color: '#c00', marginLeft: 2, background: 'none', border: 'none', cursor: 'pointer' }}>
            <FaTrash />
          </button>
        )}
        {isQuestion && (
          <button onClick={() => {
            console.log('➕ הוספת אפשרות - path:', path);
            onAdd(path);
          }} title="הוסף אפשרות" style={{ fontSize: 16, color: '#1976d2', marginLeft: 2, background: 'none', border: 'none', cursor: 'pointer' }}>
            <FaPlus />
          </button>
        )}
        <button onClick={() => {
          console.log('❓ הוספת שאלה - path:', path);
          onAddQuestion(path);
        }} title="הוסף שאלה" style={{ fontSize: 16, color: '#8D7350', marginLeft: 2, background: 'none', border: 'none', cursor: 'pointer' }}>
          <FaQuestionCircle />
        </button>
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

const DecisionTreeEditor = ({ decisionTree, mainTasks, onUpdate }) => {
  const [tree, setTree] = useState(decisionTree);
  const [initialQuestion, setInitialQuestion] = useState(decisionTree.initialQuestion || '');
  const [editingInitial, setEditingInitial] = useState(false);

  // --- סנכרון state עם props ---
  useEffect(() => {
    console.log('🔄 סנכרון state עם props חדשים');
    setTree(decisionTree);
    setInitialQuestion(decisionTree.initialQuestion || '');
  }, [decisionTree]);

  const handleEdit = (path, newValue) => {
    console.log('📝 handleEdit - path:', path, 'ערך חדש:', newValue);
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

  const handleDelete = (path) => {
    console.log('🗑️ handleDelete - path:', path);
    if (path[path.length - 2] === 'options') {
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
    }
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
    setEditingInitial(!editingInitial);
    if (editingInitial) {
      // שמירה
      console.log('💾 שמירת שאלה ראשית:', initialQuestion);
      const newTree = { ...tree, initialQuestion };
      setTree(newTree);
      onUpdate && onUpdate(newTree);
    }
  };

  return (
    <div style={{ background: '#fafafa', borderRadius: 8, border: '1px solid #E0E0E0', padding: 16, fontFamily: 'inherit', direction: 'rtl' }}>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontWeight: 'bold', fontSize: 20, color: '#8D7350' }}>
          {`עץ החלטות - ${decisionTree.title || ''}`}
        </span>
      </div>
      {editingInitial ? (
        <input
          value={initialQuestion}
          onChange={e => {
            setInitialQuestion(e.target.value);
            const newTree = { ...tree, initialQuestion: e.target.value };
            setTree(newTree);
            onUpdate && onUpdate(newTree);
          }}
          onBlur={handleInitialEdit}
          onKeyDown={e => { if (e.key === 'Enter') handleInitialEdit(); }}
          style={{ fontSize: 16, padding: '4px 8px', borderRadius: 6, border: '1px solid #CBB994', marginBottom: 10, width: '100%' }}
          autoFocus
        />
      ) : (
        <div style={{ marginBottom: 10, fontSize: 16, color: '#4E342E', cursor: 'pointer' }} onClick={() => setEditingInitial(true)}>
          {initialQuestion || 'לחץ לעריכת שאלה ראשית'}
        </div>
      )}
      <ul style={{ listStyleType: 'disc', paddingRight: 0, marginRight: 0 }}>
        <NestedListNode
          node={{ question: initialQuestion, options: tree.options }}
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onAddQuestion={handleAddQuestion}
          onEditFinalTask={handleEditFinalTask}
          mainTasks={mainTasks}
          parentPath={[]}
        />
      </ul>
    </div>
  );
};

export default DecisionTreeEditor; 