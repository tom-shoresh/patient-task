import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaListUl, FaListOl } from 'react-icons/fa';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "כתוב כאן טקסט חופשי..." }) => {
  console.log('🎨 RichTextEditor נטען עם:', { value, placeholder });
  const editorRef = React.useRef(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['right', 'left', 'center'],
        defaultAlignment: 'right',
      }),
      // אין צורך ב-BulletList, OrderedList, ListItem
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        dir: 'rtl',
        lang: 'he',
      },
      handleKeyDown: (view, event) => {
        // קיצורי מקלדת
        if (event.ctrlKey || event.metaKey) {
          switch (event.key.toLowerCase()) {
            case 'b':
              event.preventDefault();
              editor.chain().focus().toggleBold().run();
              return true;
            case 'i':
              event.preventDefault();
              editor.chain().focus().toggleItalic().run();
              return true;
            case 'u':
              event.preventDefault();
              editor.chain().focus().toggleUnderline().run();
              return true;
            case 's':
              event.preventDefault();
              editor.chain().focus().toggleStrike().run();
              return true;
          }
        }
        // קיצורי מקלדת לרשימות
        if (event.key === 'Enter' && event.shiftKey) {
          event.preventDefault();
          editor.chain().focus().toggleBulletList().run();
          return true;
        }
        if (event.key === 'Enter' && event.altKey) {
          event.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
          return true;
        }
        return false;
      },
    },
  });

  if (!editor) {
    return null;
  }

  // וודא שהעורך מקבל focus אוטומטי
  React.useEffect(() => {
    if (editor) {
      editorRef.current = editor;
      console.log('🎯 נותן focus אוטומטי לעורך');
      // השתמש ב-requestAnimationFrame כדי לוודא שהעורך מוכן
      requestAnimationFrame(() => {
        editor.commands.focus();
        console.log('✅ focus אוטומטי ניתן לעורך');
      });
    }
  }, [editor]);

  // סנכרון תוכן העורך עם value מבחוץ (לסנכרון בזמן אמת)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const ToolbarButton = ({ onClick, isActive, icon, title }) => (
    <button
      onMouseDown={e => {
        e.preventDefault();
        onClick();
      }}
      style={{
        padding: '8px',
        borderRadius: '6px',
        border: 'none',
        background: isActive ? '#8D7350' : '#f5f5f5',
        color: isActive ? '#fff' : '#4E342E',
        cursor: 'pointer',
        transition: 'all 0.2s',
        margin: '0 2px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '32px',
        height: '32px'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.background = '#e0e0e0';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.background = '#f5f5f5';
        }
      }}
      title={title}
    >
      {icon}
    </button>
  );

  return (
    <div style={{
      border: '1.5px solid #CBB994',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#FFF8F2',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* סרגל כלים */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 12px',
        borderBottom: '1px solid #CBB994',
        background: '#fafafa',
        direction: 'rtl'
      }}>
        <ToolbarButton
          onClick={() => {
            console.log('🔧 לחיצה על כפתור הדגשה');
            editor.chain().focus().toggleBold().run();
          }}
          isActive={editor.isActive('bold')}
          icon={<FaBold size={14} />}
          title="הדגשה (Ctrl+B)"
        />
        <ToolbarButton
          onClick={() => {
            console.log('🔧 לחיצה על כפתור נטוי');
            editor.chain().focus().toggleItalic().run();
          }}
          isActive={editor.isActive('italic')}
          icon={<FaItalic size={14} />}
          title="טקסט נטוי (Ctrl+I)"
        />
        <ToolbarButton
          onClick={() => {
            console.log('🔧 לחיצה על כפתור קו תחתון');
            editor.chain().focus().toggleUnderline().run();
          }}
          isActive={editor.isActive('underline')}
          icon={<FaUnderline size={14} />}
          title="קו תחתון (Ctrl+U)"
        />
        <ToolbarButton
          onClick={() => {
            console.log('🔧 לחיצה על כפתור קו חוצה');
            editor.chain().focus().toggleStrike().run();
          }}
          isActive={editor.isActive('strike')}
          icon={<FaStrikethrough size={14} />}
          title="קו חוצה"
        />
        <div style={{ width: '1px', height: '24px', background: '#CBB994', margin: '0 8px' }} />
        <ToolbarButton
          onClick={() => {
            console.log('🔧 לחיצה על כפתור רשימת בולטים');
            editor.chain().focus().toggleBulletList().run();
          }}
          isActive={editor.isActive('bulletList')}
          icon={<FaListUl size={14} />}
          title="רשימת בולטים (Shift+Enter)"
        />
        <ToolbarButton
          onClick={() => {
            console.log('🔧 לחיצה על כפתור רשימה ממוספרת');
            editor.chain().focus().toggleOrderedList().run();
          }}
          isActive={editor.isActive('orderedList')}
          icon={<FaListOl size={14} />}
          title="רשימה ממוספרת (Alt+Enter)"
        />
      </div>
      
      {/* אזור העריכה */}
      <div 
        style={{
          padding: '16px',
          minHeight: '200px',
          maxHeight: '400px',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={() => {
          console.log('🎯 לחיצה על אזור העריכה');
          if (editorRef.current) {
            editorRef.current.commands.focus();
            console.log('✅ focus ניתן לעורך מלחיצה על אזור העריכה');
          }
        }}
      >
        <EditorContent 
          editor={editor} 
          style={{
            direction: 'rtl',
            textAlign: 'right',
            fontFamily: 'inherit',
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#4E342E',
            outline: 'none'
          }}
          onFocus={() => {
            console.log('🎯 העורך קיבל focus');
          }}
          onBlur={() => {
            console.log('❌ העורך איבד focus');
          }}
        />
        {!editor.getText() && (
          <div 
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              color: '#999',
              pointerEvents: 'none',
              direction: 'rtl',
              textAlign: 'right',
              fontSize: '16px',
              fontFamily: 'inherit'
            }}
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor; 