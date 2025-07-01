import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const ArrowIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <polyline points="6,8 10,12 14,8" fill="none" stroke="#8D7350" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RoutineTasksEditor = ({ routineTasks, onUpdate, onAdd, onDelete }) => {
  const [collapsed, setCollapsed] = useState(true); // ברירת מחדל: סגור

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.type === 'ROUTINE_TASK') {
      const reordered = Array.from(routineTasks);
      const [removed] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, removed);
      onUpdate(-1, reordered); // -1 מסמן עדכון כללי
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <button onClick={() => setCollapsed(c => !c)} style={{ fontSize: 18, padding: '4px 12px', borderRadius: 6, border: '1px solid #CBB994', background: '#fafafa', color: '#8D7350', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowIcon open={!collapsed} />
          </button>
        </div>
        <Droppable droppableId="routine-tasks-droppable" type="ROUTINE_TASK">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {!collapsed && routineTasks.map((task, index) => (
                <Draggable key={index} draggableId={`routine-task-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        display: 'flex',
                        gap: 8,
                        marginBottom: 12,
                        alignItems: 'center',
                        padding: '12px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        background: snapshot.isDragging ? '#f5e9d7' : '#fafafa',
                        boxShadow: snapshot.isDragging ? '0 2px 8px #cbb99455' : undefined
                      }}
                    >
                      <span {...provided.dragHandleProps} style={{ cursor: 'grab', marginLeft: 8, color: '#CBB994', fontSize: 20 }}>☰</span>
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
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default RoutineTasksEditor; 