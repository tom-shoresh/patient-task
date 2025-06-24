import React from 'react';

const RoutineTasksEditor = ({ routineTasks, onUpdate, onAdd, onDelete }) => {
  return (
    <div style={{ padding: '0 16px' }}>
      {routineTasks.map((task, index) => (
        <div key={index} style={{ 
          display: 'flex', 
          gap: 8, 
          marginBottom: 12, 
          alignItems: 'center',
          padding: '12px',
          border: '1px solid #E0E0E0',
          borderRadius: 6,
          background: '#fafafa'
        }}>
          <input
            type="text"
            value={task}
            onChange={(e) => onUpdate(index, e.target.value)}
            style={{
              flex: 1,
              fontSize: 15,
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '8px 12px',
              background: '#fff'
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
      ))}
    </div>
  );
};

export default RoutineTasksEditor; 