import React, { useRef, useLayoutEffect, useState } from "react";
import CircleProgress from "./CircleProgress";

export default function PatientsListPanel({
  patientsList,
  archivedPatients,
  openPatient,
  selectedPatientId,
  archivePatient,
  unarchivePatient,
  deletePatient,
  deleteAllArchived,
  onMenuOpen,
  menuOpenIdx,
  menuRef,
  archivedMatchedIds,
  matchedIds,
  leftPanelWidth
}) {
  const panelRef = useRef(null);
  // הסר את כל הלוגיקה של columns

  function PatientCardMini({ p, idx, selected, onMenuOpen, menuOpenIdx, menuRef, archivePatient, deletePatient, openPatient, isArchive }) {
    return (
      <div
        key={p.identifier}
        className={"patient-card-mini" + (selected ? " selected" : "") + (isArchive ? " archived" : "")}
        style={{
          cursor: 'pointer',
          position: 'relative',
          minWidth: 116,
          maxWidth: 116,
          minHeight: 140,
          maxHeight: 180,
          margin: '0 auto',
          background: '#fffbea',
          borderRadius: 12,
          boxShadow: '0 2px 8px #e6e0d2',
          border: selected ? '2px solid #8D7350' : '1.5px solid #ccc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '8px 4px 8px 4px',
          transition: 'border 0.2s, box-shadow 0.2s',
          gap: 0
        }}
        onClick={() => openPatient(p)}
      >
        {/* תפריט שלוש נקודות */}
        <button
          className="three-dots"
          ref={menuOpenIdx === idx ? menuRef : null}
          onClick={e => { e.stopPropagation(); onMenuOpen(idx); }}
          style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: 20, color: '#8D7350', zIndex: 2, width: 28, height: 28 }}
        >⋮</button>
        {menuOpenIdx === idx && (
          <div style={{ position: 'absolute', top: 36, right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: 8, boxShadow: '0 2px 8px #e6e0d2', zIndex: 100 }}>
            {isArchive ? (
              <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                onMouseDown={e => { e.stopPropagation(); archivePatient && archivePatient(p.identifier); onMenuOpen(null); }}
              >החזר</div>
            ) : (
              <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                onMouseDown={e => { e.stopPropagation(); archivePatient && archivePatient(p.identifier); onMenuOpen(null); }}
              >העבר לארכיון</div>
            )}
            <div style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }}
              onMouseDown={e => { e.stopPropagation(); deletePatient(p.identifier, isArchive); onMenuOpen(null); }}
            >מחק</div>
          </div>
        )}
        {/* שם תיק */}
        <div className="card-title-ellipsis" style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 2, marginTop: 2, width: '100%', textAlign: 'center', whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', lineHeight: 1.15 }}>{p.identifier}</div>
        {/* שיוך */}
        {p.population && (
          <div style={{ fontSize: 13, color: '#666', marginBottom: 2, textAlign: 'center', width: '100%', whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', lineHeight: 1.1 }}>{p.population}</div>
        )}
        {/* מעגל אחוזי השלמה */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: '8px 0 0 0' }}>
          <CircleProgress percent={typeof p.percent === 'number' ? p.percent : 0} size={48} stroke={6} />
        </div>
      </div>
    );
  }

  return (
    <div ref={panelRef} className="patients-list-panel" style={{ width: leftPanelWidth, minWidth: 212, maxWidth: 400, direction: 'rtl', boxSizing: 'border-box', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* כותרת */}
      <div className="patients-list-title" style={{ fontWeight: 'bold', color: '#8D7350', fontSize: 22, marginBottom: 12, textAlign: 'right' }}>ניהול תיקים</div>
      {/* כפתורי ניהול המוני */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {patientsList.length > 0 && (
          <button style={{ background: '#bdb76b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', padding: '7px 0', fontSize: 14, cursor: 'pointer', width: 180, minWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => patientsList.forEach(p => archivePatient(p.identifier))}>
            העבר את כל התיקים לארכיון
          </button>
        )}
        {archivedPatients.length > 0 && (
          <button style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', padding: '7px 0', fontSize: 14, cursor: 'pointer', width: 180, minWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => archivedPatients.forEach(p => unarchivePatient(p.identifier))}>
            שחזר את כל התיקים מהארכיון
          </button>
        )}
      </div>
      {/* רשימת תיקים */}
      <div className="patients-list-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(116px, 1fr))', gap: 16 }}>
        {patientsList.length === 0 ? (
          <div style={{ color: '#888', fontSize: 16, textAlign: 'center', padding: '20px 0', gridColumn: '1/-1' }}>
            אין תיקים להצגה
          </div>
        ) : (
          patientsList.map((p, idx) => (
            <PatientCardMini
              key={p.identifier}
              p={p}
              idx={idx}
              selected={selectedPatientId === p.identifier}
              onMenuOpen={onMenuOpen}
              menuOpenIdx={menuOpenIdx}
              menuRef={menuRef}
              archivePatient={archivePatient}
              deletePatient={deletePatient}
              openPatient={openPatient}
              isArchive={false}
            />
          ))
        )}
      </div>
      {/* ארכיון */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 'bold', color: '#8D7350', fontSize: 18, marginBottom: 8 }}>ארכיון</div>
        <div className="archived-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(116px, 1fr))', gap: 16 }}>
          {archivedPatients.length === 0 ? (
            <div style={{ color: '#888', fontSize: 15, textAlign: 'center', padding: '10px 0' }}>הארכיון ריק</div>
          ) : (
            archivedPatients.map((p, idx) => (
              <PatientCardMini
                key={p.identifier}
                p={p}
                idx={`a${idx}`}
                selected={archivedMatchedIds.includes(p.identifier)}
                onMenuOpen={onMenuOpen}
                menuOpenIdx={menuOpenIdx}
                menuRef={menuRef}
                archivePatient={unarchivePatient}
                deletePatient={deletePatient}
                openPatient={openPatient}
                isArchive={true}
              />
            ))
          )}
        </div>
        {/* כפתור מחיקת כל הארכיון */}
        {archivedPatients.length > 0 && (
          <button
            onClick={deleteAllArchived}
            style={{ width: 180, minWidth: 180, marginTop: 12, background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 'bold', padding: '10px 0', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            מחק את כל התיקים בארכיון
          </button>
        )}
      </div>
    </div>
  );
} 