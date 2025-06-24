import React, { useState } from 'react';

const DecisionTreeEditor = ({ decisionTree, onUpdate }) => {
  const [localTree, setLocalTree] = useState(decisionTree || {
    question: "",
    options: []
  });

  const updateTree = (newTree) => {
    setLocalTree(newTree);
    onUpdate(newTree);
  };

  const addOption = () => {
    const newOption = { text: "אפשרות חדשה", action: "task" };
    const updatedTree = {
      ...localTree,
      options: [...(localTree.options || []), newOption]
    };
    updateTree(updatedTree);
  };

  const updateOption = (index, field, value) => {
    const updatedOptions = [...localTree.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    const updatedTree = { ...localTree, options: updatedOptions };
    updateTree(updatedTree);
  };

  const deleteOption = (index) => {
    const updatedOptions = localTree.options.filter((_, i) => i !== index);
    const updatedTree = { ...localTree, options: updatedOptions };
    updateTree(updatedTree);
  };

  return (
    <div style={{ 
      border: '1px solid #E0E0E0', 
      borderRadius: 8, 
      padding: '16px',
      background: '#fafafa'
    }}>
      <h4 style={{ color: '#4E342E', fontSize: 16, margin: '0 0 12px 0' }}>שאלה ראשית:</h4>
      <input
        type="text"
        value={localTree.question || ""}
        onChange={(e) => updateTree({ ...localTree, question: e.target.value })}
        style={{
          width: '100%',
          fontSize: 15,
          border: '1px solid #ccc',
          borderRadius: 4,
          padding: '8px 12px',
          background: '#fff',
          marginBottom: 16
        }}
      />
      
      <h4 style={{ color: '#4E342E', fontSize: 16, margin: '0 0 12px 0' }}>אפשרויות:</h4>
      {localTree.options?.map((option, index) => (
        <div key={index} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={option.text}
              onChange={(e) => updateOption(index, 'text', e.target.value)}
              placeholder="טקסט האפשרות"
              style={{
                flex: 1,
                fontSize: 14,
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: '6px 8px',
                background: '#fff'
              }}
            />
            <select
              value={option.action}
              onChange={(e) => updateOption(index, 'action', e.target.value)}
              style={{
                fontSize: 14,
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: '6px 8px',
                background: '#fff'
              }}
            >
              <option value="task">משימה</option>
              <option value="population">אוכלוסייה</option>
              <option value="both">משימה ואוכלוסייה</option>
            </select>
            <button
              onClick={() => deleteOption(index)}
              style={{
                padding: '4px 8px',
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
      ))}
      <button
        onClick={addOption}
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
        הוסף אפשרות
      </button>
    </div>
  );
};

export default DecisionTreeEditor; 