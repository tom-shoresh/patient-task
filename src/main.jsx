import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

function PasswordProtect({ children }) {
  const [entered, setEntered] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const checkPassword = (e) => {
    e.preventDefault();
    if (input === "1005") {
      setEntered(true);
      setError("");
    } else {
      setError("סיסמה שגויה");
    }
  };

  if (entered) return children;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
      <form onSubmit={checkPassword} style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 12px #cbb99433', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 280 }}>
        <label style={{ fontSize: 18, color: '#8D7350', textAlign: 'center' }}>הזן סיסמה כדי להיכנס</label>
        <input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ fontSize: 18, padding: 10, borderRadius: 6, border: '1px solid #CBB994', textAlign: 'center' }}
          autoFocus
        />
        <button type="submit" style={{ fontSize: 18, padding: '8px 0', borderRadius: 6, background: '#CBB994', color: '#fff', border: 'none', cursor: 'pointer' }}>כניסה</button>
        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
      </form>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PasswordProtect>
      <App />
    </PasswordProtect>
  </React.StrictMode>
);
