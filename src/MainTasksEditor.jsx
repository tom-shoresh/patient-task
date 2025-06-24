import React from 'react';

const MainTasksEditor = ({ mainTasks, onUpdate, onAdd, onDelete }) => {
  const updateTask = (taskIndex, updatedTask) => {
    onUpdate(taskIndex, updatedTask);
  };

  const updateSubtask = (taskIndex, subIndex, newValue) => {
    const task = mainTasks[taskIndex];
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subIndex] = newValue;
    const updatedTask = { ...task, subtasks: updatedSubtasks };
    onUpdate(taskIndex, updatedTask);
  };

  const addSubtask = (taskIndex) => {
    const task = mainTasks[taskIndex];
    const updatedSubtasks = [...task.subtasks, "תת-משימה חדשה"];
    const updatedTask = { ...task, subtasks: updatedSubtasks };
    onUpdate(taskIndex, updatedTask);
  };

  const deleteSubtask = (taskIndex, subIndex) => {
    const task = mainTasks[taskIndex];
    const updatedSubtasks = task.subtasks.filter((_, i) => i !== subIndex);
    const updatedTask = { ...task, subtasks: updatedSubtasks };
    onUpdate(taskIndex, updatedTask);
  };

  return (
    <div style={{ padding: '0 16px' }}>
      {mainTasks.map((task, index) => (
        <div key={index} style={{ 
          marginBottom: 24, 
          border: '1px solid #E0E0E0', 
          borderRadius: 8, 
          padding: '16px',
          background: '#fafafa'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <input
              type="text"
              value={task.title}
              onChange={(e) => {
                const updatedTask = { ...task, title: e.target.value };
                updateTask(index, updatedTask);
              }}
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: '8px 12px',
                background: '#fff',
                color: '#4E342E',
                width: '60%'
              }}
            />
            <button
              onClick={() => onDelete(index)}
              style={{
                padding: '6px 12px',
                background: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              מחק
            </button>
          </div>
          
          <div style={{ marginBottom: 12 }}>
            <h5 style={{ color: '#666', fontSize: 14, margin: '0 0 8px 0' }}>תתי-משימות:</h5>
            {task.subtasks.map((subtask, subIndex) => (
              <div key={subIndex} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={subtask}
                  onChange={(e) => updateSubtask(index, subIndex, e.target.value)}
                  style={{
                    flex: 1,
                    fontSize: 14,
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    padding: '6px 8px',
                    background: '#fff'
                  }}
                />
                <button
                  onClick={() => deleteSubtask(index, subIndex)}
                  style={{
                    padding: '4px 8px',
                    background: '#ff9800',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  מחק
                </button>
              </div>
            ))}
            <button
              onClick={() => addSubtask(index)}
              style={{
                padding: '6px 12px',
                background: '#2196F3',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              הוסף תת-משימה
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MainTasksEditor; 