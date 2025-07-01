import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const MainTasksEditor = ({ mainTasks, onUpdate, onAdd, onDelete }) => {
  const [collapsedTasks, setCollapsedTasks] = useState(() => {
    const obj = {};
    mainTasks.forEach((_, idx) => { obj[idx] = true; });
    return obj;
  });
  const [collapsedAll, setCollapsedAll] = useState(false);

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

  const toggleTaskCollapse = (idx) => {
    setCollapsedTasks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAllCollapse = () => {
    const newCollapsed = !collapsedAll;
    setCollapsedAll(newCollapsed);
    setCollapsedTasks(() => {
      const obj = {};
      mainTasks.forEach((_, idx) => { obj[idx] = true; });
      return obj;
    });
  };

  const ArrowIcon = ({ open }) => (
    <svg width="18" height="18" viewBox="0 0 20 20" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
      <polyline points="6,8 10,12 14,8" fill="none" stroke="#8D7350" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.type === 'MAIN_TASK') {
      const reordered = Array.from(mainTasks);
      const [removed] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, removed);
      onUpdate(-1, reordered);
    }
    if (result.type.startsWith('SUBTASK_')) {
      const taskIdx = parseInt(result.type.replace('SUBTASK_', ''));
      const subtasks = Array.from(mainTasks[taskIdx].subtasks);
      const [removed] = subtasks.splice(result.source.index, 1);
      subtasks.splice(result.destination.index, 0, removed);
      const updatedTask = { ...mainTasks[taskIdx], subtasks };
      onUpdate(taskIdx, updatedTask);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <button onClick={toggleAllCollapse} style={{ fontSize: 18, padding: '4px 12px', borderRadius: 6, border: '1px solid #CBB994', background: '#fafafa', color: '#8D7350', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowIcon open={!collapsedAll} />
          </button>
        </div>
        <Droppable droppableId="main-tasks-droppable" type="MAIN_TASK">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {!collapsedAll && mainTasks.map((task, index) => (
                <Draggable key={index} draggableId={`main-task-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        marginBottom: 24,
                        border: '1px solid #E0E0E0',
                        borderRadius: 8,
                        padding: '16px',
                        background: snapshot.isDragging ? '#f5e9d7' : '#fafafa',
                        boxShadow: snapshot.isDragging ? '0 2px 8px #cbb99455' : undefined
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span {...provided.dragHandleProps} style={{ cursor: 'grab', marginLeft: 8, color: '#CBB994', fontSize: 20 }}>☰</span>
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
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => toggleTaskCollapse(index)}
                            style={{
                              padding: '6px 12px',
                              background: '#CBB994',
                              color: '#4E342E',
                              border: 'none',
                              borderRadius: 4,
                              fontSize: 18,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title={collapsedTasks[index] ? 'הצג תתי-משימות' : 'הסתר תתי-משימות'}
                          >
                            <ArrowIcon open={!collapsedTasks[index]} />
                          </button>
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
                      </div>
                      {!collapsedTasks[index] && (
                        <Droppable droppableId={`subtasks-droppable-${index}`} type={`SUBTASK_${index}`}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} style={{ marginBottom: 12 }}>
                              <h5 style={{ color: '#666', fontSize: 14, margin: '0 0 8px 0' }}>תתי-משימות:</h5>
                              {task.subtasks.map((subtask, subIndex) => (
                                <Draggable key={subIndex} draggableId={`subtask-${index}-${subIndex}`} index={subIndex}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      style={{
                                        ...provided.draggableProps.style,
                                        display: 'flex',
                                        gap: 8,
                                        marginBottom: 8,
                                        alignItems: 'center',
                                        background: snapshot.isDragging ? '#e3f2fd' : undefined
                                      }}
                                    >
                                      <span {...provided.dragHandleProps} style={{ cursor: 'grab', color: '#2196F3', fontSize: 18 }}>☰</span>
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
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
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
                          )}
                        </Droppable>
                      )}
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

export default MainTasksEditor; 