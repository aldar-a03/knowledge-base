import React, {
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  EditorContent,
  useEditor,
  ReactNodeViewRenderer,
  NodeViewWrapper,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  ResizableImage,
  ImageResizer,        // ← готовый node-view
} from 'tiptap-extension-resizable-image';
import Underline   from '@tiptap/extension-underline';
import TextAlign   from '@tiptap/extension-text-align';
import Table       from '@tiptap/extension-table';
import TableRow    from '@tiptap/extension-table-row';
import TableCell   from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Modal       from 'react-modal';
import './styles/RichTextEditor.css';
import 'tiptap-extension-resizable-image/styles.css';

const WrappedImageResizer = (props) => (
  <NodeViewWrapper className="image-resizer">
    <ImageResizer {...props} />
  </NodeViewWrapper>
);

Modal.setAppElement('#root');

const RichTextEditorWithTables = forwardRef(({ value, onChange }, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [showDel, setShowDel] = useState(false);
  const [delPos, setDelPos] = useState({ top: 0, left: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bulletList: { keepMarks: true } }),
      Underline,

      ResizableImage.configure({
        minWidth: 100,
        minHeight: 100,
        resizeHandleStyle: 'corner',
      }),

      TextAlign.configure({ types: ['heading', 'paragraph', 'imageComponent'] }),
      Table.configure({ resizable: true }),
      TableRow.extend({ isolating: true }),
      TableHeader,
      TableCell,
    ],

    content: value,
    onCreate({ editor }) {                 // ← добавляем
    window.__xt = editor;                // кладём глобально
    console.log('TIPTAP ready');         // увидите в консоли
  },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  /* ——— метод для вставки blob-URL из родителя ——— */
useImperativeHandle(ref, () => ({
insertImage: (url, placeholderId) => {
  if (!editor) return;
  
  // ①  вставляем «заглушку» 300×300
  const { from } = editor.state.selection;
  editor
    .chain()
    .focus()
    .insertContentAt(from, {
      type: 'imageComponent',
      attrs: {
        src: url,
        width: 300,
        height: 200,
        'data-placeholder': placeholderId,
      },
    })
    .run();

      /* ===== DEBUG ===== */
  console.log('[IMAGE] stub inserted');

  // ②  после реальной загрузки корректируем размеры
  const img = new Image();
  img.onload = () => {
     console.log('[IMAGE] onload', img.naturalWidth, img.naturalHeight);   // ← должно появиться
    editor.commands.command(({ tr, state }) => {
      state.doc.descendants((node, pos) => {
        if (
          node.type.name === 'imageComponent' &&
          node.attrs['data-placeholder'] === placeholderId
        ) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          return false; // остановить обход
        }
        return true;
      });
      return true;
    });
  };
  img.src = url;
},
}));

  /* ——— подмена контента извне ——— */
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  /* ——— показать кнопку удаления таблицы ——— */
  useEffect(() => {
    const onClick = (e) => {
      const tbl = e.target.closest('table');
      const wrapper = document.querySelector('.editor-area-wrapper');
      if (tbl && editor && wrapper && wrapper.contains(tbl)) {
        setDelPos({
          top: tbl.offsetTop + 4,
          left: tbl.offsetLeft + tbl.offsetWidth - 20,
        });
        setShowDel(true);
      } else {
        setShowDel(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [editor]);

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
    setShowDel(false);
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    setIsModalOpen(false);
  };

  /* ——— тулбар ——— */
  const menu = useMemo(() => {
    if (!editor) return null;
    return (
      <>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'active' : ''}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'active' : ''}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'active' : ''}>U</button>

        <span className="divider" />

        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}>⯇</button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}>⯈⯇</button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}>⯈</button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}>≡</button>

        <span className="divider" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'active' : ''}>•••</button>

        <span className="divider" />

        <button type="button" onClick={() => setIsModalOpen(true)}>📊</button>
      </>
    );
  }, [editor]);

  if (!editor) return null;

  /* ——— рендер ——— */
  return (
    <div className="editor-row">
      <div className="editor-content-wrapper">
        <div className="menu-bar">{menu}</div>

        <div className="editor-area-wrapper">
          <EditorContent editor={editor} className="editor-area" />

          {showDel && (
            <button className="delete-table-button"
                    style={{ top: delPos.top, left: delPos.left }}
                    onClick={deleteTable}>✕</button>
          )}
        </div>

        <Modal isOpen={isModalOpen}
               onRequestClose={() => setIsModalOpen(false)}
               className="modal"
               overlayClassName="modal-overlay">
          <h3>Размер таблицы</h3>
          <label>
            Строки:
            <input type="number" min="1" value={rows}
                   onChange={e => setRows(+e.target.value)} />
          </label>
          <label>
            Столбцы:
            <input type="number" min="1" value={cols}
                   onChange={e => setCols(+e.target.value)} />
          </label>
          <div className="modal-actions">
            <button onClick={addTable}>Создать</button>
            <button onClick={() => setIsModalOpen(false)}>Отмена</button>
          </div>
        </Modal>
      </div>
    </div>
  );
});

export default RichTextEditorWithTables;
