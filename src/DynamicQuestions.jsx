import React, { useState } from "react";

export default function DynamicQuestions({ decisionTree, onFinish }) {
  if (!decisionTree || typeof decisionTree !== 'object') {
    return <div style={{color: '#c00', textAlign: 'center', margin: 30}}>שגיאה: עץ ההחלטה לא נטען או לא תקין</div>;
  }

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  // מיפוי שיוך מקוצר
  const getShortAffiliation = (full) => {
    if (!full) return '';
    if (full.startsWith('כלל (חרבות ברזל')) return 'כלל (חרבות ברזל)';
    if (full.startsWith('כלל (פסיכופתולוגיה')) return 'כלל (פסיכופתולוגיה)';
    if (full.startsWith('כלל (משבר חריף')) return 'כלל (משבר חריף)';
    if (full.startsWith('כלל')) return 'כלל';
    if (full.startsWith('קצין לוחם')) return 'קצין לוחם';
    if (full.startsWith('מפקד לוחם')) return 'מפקד לוחם';
    if (full.startsWith('צמי"ד')) return 'צמי"ד';
    return full;
  };

  // שלב 0: שיוך
  if (step === 0) {
    return (
      <div className="dynamic-questions" dir="rtl">
        <h3>{decisionTree.initialQuestion}</h3>
        {decisionTree.options.map((opt) => (
          <button key={opt.name} onClick={() => {
            if (opt.finalTask) {
              const shortAff = getShortAffiliation(opt.name);
              onFinish({ finalTask: opt.finalTask, population: shortAff });
            } else {
              setAnswers({ affiliation: opt.name });
              setStep(1);
            }
          }} className="dq-btn">{opt.name}</button>
        ))}
      </div>
    );
  }

  // שלב 1: סוג הפניה
  if (step === 1) {
    const selectedOption = decisionTree.options.find(opt => opt.name === answers.affiliation);
    if (!selectedOption || !selectedOption.nextQuestion) return null;

    return (
      <div className="dynamic-questions" dir="rtl">
        <h3>{selectedOption.nextQuestion.question}</h3>
        {selectedOption.nextQuestion.options.map((opt) => (
          <button key={opt.name} onClick={() => { 
            setAnswers(a => ({ ...a, referralType: opt.name })); 
            if (opt.finalTask) {
              const shortAff = getShortAffiliation(answers.affiliation);
              onFinish({ finalTask: opt.finalTask, population: shortAff });
            } else if (opt.nextQuestion) {
              setStep(2);
            }
          }} className="dq-btn">{opt.name}</button>
        ))}
      </div>
    );
  }

  // שלב 2: שאלות נוספות (אם יש)
  if (step === 2) {
    const selectedOption = decisionTree.options.find(opt => opt.name === answers.affiliation);
    if (!selectedOption || !selectedOption.nextQuestion) return null;
    
    const referralOption = selectedOption.nextQuestion.options.find(opt => opt.name === answers.referralType);
    if (!referralOption || !referralOption.nextQuestion) return null;

    return (
      <div className="dynamic-questions" dir="rtl">
        <h3>{referralOption.nextQuestion.question}</h3>
        {referralOption.nextQuestion.options.map((opt) => (
          <button key={opt.name} onClick={() => {
            const shortAff = getShortAffiliation(answers.affiliation);
            onFinish({ finalTask: opt.finalTask, population: shortAff });
          }} className="dq-btn">{opt.name}</button>
        ))}
      </div>
    );
  }

  // לא אמור להגיע לכאן
  return null;
} 