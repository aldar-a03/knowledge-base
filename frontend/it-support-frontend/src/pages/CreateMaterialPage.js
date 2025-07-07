import React, {
  useState,
  useEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import Navbar from "../components/Navbar";
import RichTextEditorWithTables from "../components/RichTextEditorWithTables";
import "./styles/EditMaterialPage.css";

/**
 * Страница создания материала с поддержкой загрузки изображений ✨
 * – PNG / JPEG вставляются прямо в текст (blob превью → после save подменяются на постоянные URL)
 * – остальные файлы (PDF / DOCX и др.) отображаются списком «Вложения»
 */
const CreateMaterialPage = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null); // <RichTextEditorWithTables ref={editorRef} … />

  // form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState("");

  // attachments state
  const [images, setImages] = useState([]); // { file, placeholderId }
  const [docs, setDocs] = useState([]); // File[]
  const fileInputRef = useRef(null);

  /* ────────────────────────────── API ────────────────────────────── */

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data))
      .catch(() => setError("Не удалось загрузить категории"));
  }, []);

  /**
   * Обработчик выбора файлов (из диалога)
   */
  const handleSelectedFiles = (e) => {
    const picked = Array.from(e.target.files);
    console.log('picked', picked);

    const accImgs = [];
    const accDocs = [];

    picked.forEach((f) => {
      if (f.type.startsWith("image/")) {
        const phId = crypto.randomUUID();
        editorRef.current?.insertImage(URL.createObjectURL(f), phId);
        console.log('insert', phId, !!editorRef.current);
        accImgs.push({ file: f, placeholderId: phId });
      } else {
        accDocs.push(f);
      }
    });

    setImages((prev) => [...prev, ...accImgs]);
    setDocs((prev) => [...prev, ...accDocs]);
  };

  /**
   * POST /materials  →  POST /attachments  →  PATCH content img src
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      const categoryIds = selectedCategories.map((c) => c.value);

      // 1️⃣  создаём материал (пока контент содержит blob: ссылки)
      const { data: material } = await axios.post(
        "http://localhost:8080/materials",
        { title, content, categoryIds },
        auth
      );

      // 2️⃣ Загружаем файлы и сразу подменяем blob:-ссылки
      let finalHtml = content;
      if (images.length || docs.length) {
        const fd = new FormData();
        images.forEach(i => fd.append("files", i.file));
        docs.forEach(d => fd.append("files", d));
        const { data: atts } = await axios.post(
          `http://localhost:8080/materials/${material.id}/attachments`,
          fd,
          { headers: { ...auth.headers, "Content-Type": "multipart/form-data" } }
        );
        
        finalHtml = replacePlaceholdersFromAttachments(content, atts);
      }

      // 3️⃣ Всегда обновляем контент без blob:
      await axios.put(
        `http://localhost:8080/materials/${material.id}`,
        { title, content: finalHtml, categoryIds },
        auth
      );

          navigate(`/materials/${material.id}`);
        } catch {
          setError("Ошибка при создании материала");
        }
      };

  /* ───────────────────────────── UI ───────────────────────────── */

  return (
    <>
      <Navbar />
      <div className="edit-material-wrapper">
        <h2>Создание нового материала</h2>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="edit-form">
          <label>Заголовок</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <RichTextEditorWithTables ref={editorRef} value={content} onChange={setContent} />

          {/* attachments UI */}
         <div className="form-group">
          <label>Файлы</label>
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="file-upload-button"
          >
            Прикрепить файлы
          </button>
        </div>

          <input
            type="file"
            hidden
            ref={fileInputRef}
            multiple
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
            onChange={handleSelectedFiles}
          />

          {docs.length > 0 && (
            <ul className="file-list">
              {docs.map((f) => (
                <li key={f.name}>
                  {f.name} ({(f.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          )}

          <label>Категории</label>
          <Select
            isMulti
            options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
            value={selectedCategories}
            onChange={setSelectedCategories}
            placeholder="Выберите категории..."
          />

          <button type="submit">Создать</button>
        </form>
      </div>
    </>
  );
};



/**
 * Заменяет все blob:-ссылки на реальные URL по id вложений.
 * @param {string} html — исходный HTML с blob:ссылками
 * @param {Array<{id: string, contentType: string}>} attachments — массив от бэка
 * @returns {string}
 */
function replacePlaceholdersFromAttachments(html, attachments) {
  let res = html;
  attachments
    .filter(a => a.contentType.startsWith("image/"))
    .forEach(a => {
      // Подменяем все src="blob:..." на стабильный URL
      res = res.replace(
        /src="blob:[^"]*"/g,
        `src="http://localhost:8080/materials/attachments/${a.id}"`
      );
    });
  return res;
}

export default CreateMaterialPage;
