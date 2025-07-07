// src/pages/EditMaterialPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import Navbar from '../components/Navbar';
import RichTextEditorWithTables from '../components/RichTextEditorWithTables';
import './styles/EditMaterialPage.css';

const EditMaterialPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const location = useLocation();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState('');

  const [existingDocs, setExistingDocs] = useState([]); // ← файлы из базы
  const [newDocs, setNewDocs] = useState([]);           // ← новые файлы от пользователя

  const [existingAttachments, setExistingAttachments] = useState([]);

  const [images, setImages] = useState([]);

  const fileInputRef = useRef(null);

  const [removedDocs, setRemovedDocs] = useState([]);

const handleSelectedFiles = (e) => {
  const picked = Array.from(e.target.files);
  const accImgs = [];
  const accDocs = [];

  picked.forEach((f) => {
    if (f.type.startsWith("image/")) {
      const phId = crypto.randomUUID();
      editorRef.current?.insertImage(URL.createObjectURL(f), phId);
      accImgs.push({ file: f, placeholderId: phId });
    } else {
      accDocs.push({
      id: undefined,           
      originalName: f.name,
      size: f.size,
      file: f                 // сохраним сам объект для загрузки
    });
    }
  });

  setImages((prev) => [...prev, ...accImgs]);
  setNewDocs((prev) => [...prev, ...accDocs]);
};


  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/materials/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTitle(res.data.title);
        const withRealImgUrls = replacePlaceholdersFromAttachments(res.data.content, res.data.attachments || []);
        setContent(withRealImgUrls);

        // Сохраняем все вложения, чтобы потом можно было определить, какие изображения удалить
        setExistingAttachments(res.data.attachments || []);

       // Выделяем документы
      const docFiles = res.data.attachments?.filter(a => !a.contentType.startsWith("image/")) || [];
      setExistingDocs(docFiles);
;


        const cats = await axios.get('http://localhost:8080/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(cats.data);
        const mapped = res.data.categoryNames.map(name => {
          const match = cats.data.find(c => c.name === name);
          return match ? { value: match.id, label: match.name } : null;
        }).filter(Boolean);
        setSelectedCategories(mapped);
      } catch {
        setError('Ошибка при загрузке данных');
      }
    };
    fetch();
  }, [id]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const token = localStorage.getItem("token");
    const auth = { headers: { Authorization: `Bearer ${token}` } };
    const categoryIds = selectedCategories.map((c) => c.value);

    let finalHtml = content;

    // Если есть файлы — загружаем их
    const newFiles = [
      ...images.map((i) => i.file),
      ...newDocs.map((d) => d.file),
    ];

    if (newFiles.length > 0) {
      const fd = new FormData();
      newFiles.forEach((f) => fd.append("files", f));
      const { data: atts } = await axios.post(
        `http://localhost:8080/materials/${id}/attachments`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      finalHtml = replacePlaceholders(content, images, atts);
    }

    // Удаляем неиспользуемые изображения
    const usedImageIds = extractUsedImageIdsFromHtml(finalHtml);
    const allImageAttachments = existingAttachments.filter(a => a.contentType.startsWith("image/"));
    const unusedImages = allImageAttachments.filter(a => !usedImageIds.includes(a.id));

    for (const img of unusedImages) {
      await axios.delete(`http://localhost:8080/materials/attachments/${img.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    // Удаляем отмеченные для удаления документы
    for (const doc of removedDocs) {
      if (doc.id) {
        try {
          await axios.delete(`http://localhost:8080/materials/attachments/${doc.id}`, auth);
        } catch (e) {
          console.warn("Ошибка удаления документа:", doc.id, e);
        }
      }
    }


    // финальный PUT с обновлённым content
    await axios.put(
      `http://localhost:8080/materials/${id}`,
      { title, content: finalHtml, categoryIds },
      auth
    );

    navigate(`/materials/${id}`, {
      state: { from: location.state?.from || "/home" },
      replace: true,
    });
  } catch (err) {
    console.error(err);
    setError("Ошибка при сохранении изменений");
  }
};



  return (
    <>
      <Navbar />
      <div className="edit-material-wrapper">
        <h2>Редактирование материала</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="edit-form">
          <label>Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <RichTextEditorWithTables
            ref={editorRef}
            label="Содержимое"
            value={content}
            onChange={setContent}
          />

        <div className="form-group">

  <label>Файлы</label>

    <ul style={{ paddingLeft: 0 }}>
  {[
    // сначала «старые»:
    ...existingDocs.filter(f => !removedDocs.some(r => r.id === f.id))
      .map(f => ({ ...f, __isNew: false })),
    // затем «новые»:
    ...newDocs.map((f, i) => ({ ...f, __isNew: true, __idx: i }))
  ].map(item => (
    <li key={item.__isNew ? `new-${item.__idx}` : item.id} className="inline-file">
      {item.__isNew
        ? (
          <span style={{ lineHeight: 1, display: 'inline-block' }}>
            {item.originalName} ({(item.size/1024).toFixed(1)} KB)
          </span>
        )
        : (
          <a
            href={`http://localhost:8080/materials/attachments/${item.id}`}
            download
            rel="noopener noreferrer"
            style={{ lineHeight: 1, display: 'inline-block' }}
          >
            {item.originalName} ({(item.size/1024).toFixed(1)} KB)
          </a>
        )
      }

      <button
        type="button"
        className="file-remove-btn"
        title="Удалить файл"
        onClick={() => {
          if (item.__isNew) {
            // убрать из newDocs
            setNewDocs(nd => nd.filter((_, idx) => idx !== item.__idx));
          } else {
            // отметить для удаления
            setRemovedDocs(rd => [...rd, item]);
          }
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'red',
          fontSize: '16px',
          lineHeight: 1,
          padding: 0,
          marginLeft: 4,
          cursor: 'pointer',
          verticalAlign: 'middle'
        }}
      >
        ✖
      </button>
    </li>
  ))}
</ul>

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




          <label>Категории</label>
          <Select
            isMulti
            options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
            value={selectedCategories}
            onChange={setSelectedCategories}
            placeholder="Выберите категории..."
          />

          <button type="submit">Сохранить</button>
        </form>
      </div>
    </>
  );
};

function replacePlaceholders(html, imgs, atts) {
  let res = html;
  imgs.forEach((img) => {
    const found = atts.find((a) => a.originalName === img.file.name);
    if (found) {
      const reg = new RegExp(`data-placeholder=\"${img.placeholderId}\"[^>]*src=\"[^\"]+\"`);
      res = res.replace(reg, `src="http://localhost:8080/materials/attachments/${found.id}"`);
    }
  });
  return res;
}

function replacePlaceholdersFromAttachments(html, attachments) {
  let res = html;

  attachments
    .filter((a) => a.contentType.startsWith("image/"))
    .forEach((a) => {
      // Подменяем любой <img src="blob:..."> на src="/materials/attachments/{id}"
      const pattern = new RegExp(`src="blob:[^"]*"`, "g");
      res = res.replace(pattern, `src="http://localhost:8080/materials/attachments/${a.id}"`);
    });

  return res;
}

function extractUsedImageIdsFromHtml(html) {
  const matches = html.match(/\/materials\/attachments\/([a-f0-9-]{36})/g) || [];
  return matches.map(url => url.split("/").pop());
}

export default EditMaterialPage;
