import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllCategories } from '../api/categories';
import SearchBar from '../components/SearchBar';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './styles/HomePage.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const HomePage = () => {
  /* ───────── state ───────── */
  const [categories,      setCategories]      = useState([]);
  const [searchResults,   setSearchResults]   = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [keyword,         setKeyword]         = useState('');
  const [page,            setPage]            = useState(0);
  const [totalPages,      setTotalPages]      = useState(0);
  const [suggestion,      setSuggestion]      = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get('keyword');

  /* ───────── загрузка категорий + поиск при F5 ───────── */
  useEffect(() => {
    getAllCategories()
      .then(setCategories)
      .catch(err => console.error('Ошибка загрузки категорий:', err));

    if (initialKeyword) handleSearch(initialKeyword);
  }, []);

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const kw = params.get('keyword');

  if (!kw) {
    // вернулись «на главную» — очистить состояние
    setSearchPerformed(false);
    setSearchResults([]);
    setSuggestion(null);
    setKeyword('');
    setPage(0);
    setTotalPages(0);
  }
}, [location.search]); // смена адресной строки


  /* ───────── поиск ───────── */
  const handleSearch = async kw => {
    try {
      setKeyword(kw);
      const token = localStorage.getItem('token');

      const res = await axios.get('http://localhost:8080/materials/search', {
        params: { keyword: kw, page: 0, size: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data;
      setSearchResults(data.items || []);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setSuggestion(data.suggestion || null);
      setSearchPerformed(true);

      navigate(`/home?keyword=${encodeURIComponent(kw)}`);
    } catch (err) {
      console.error('Ошибка поиска:', err);
    }
  };

  /* ───────── пагинация «Назад / Вперёд» ───────── */
  const handlePageChange = async newPage => {
    if (newPage < 0 || newPage >= totalPages) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/materials/search', {
        params: { keyword, page: newPage, size: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setSearchResults(data.items || []);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Ошибка пагинации:', err);
    }
  };

  /* ───────── клик по категории ───────── */
  const handleCategoryClick = id => navigate(`/category/${id}`);

  const handleDeleteCategory = id => {
    confirmAlert({
      title: 'Подтверждение удаления',
      message: 'Вы уверены, что хотите удалить эту категорию?',
      buttons: [
        {
          label: 'Да',
          onClick: async () => {
            try {
              const token = localStorage.getItem('token');
              await axios.delete(`http://localhost:8080/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setCategories(prev => prev.filter(cat => cat.id !== id));
            } catch (err) {
              console.error('Ошибка удаления категории:', err);
            }
          }
        },
        { label: 'Отмена' }
      ]
    });
  };

  /* ───────── JSX ───────── */
  return (
    <>
      <Navbar />
      <div className={`home-wrapper ${searchPerformed ? 'left-align' : 'center-align'}`}>
        <h1>Поиск по базе знаний</h1>
        <p>Выберите категорию, чтобы просмотреть материалы</p>
        <SearchBar
          onSearch={handleSearch}
          alignLeft={searchPerformed}
          value={keyword}              // ← передаём keyword в поле
          onChange={setKeyword}        // ← синхронизируем с полем
        />


        {/* ─── блок результатов ─── */}
        {searchPerformed && (
          <div className="search-section">
            <h2>Результаты поиска:</h2>

            {searchResults.length === 0 ? (
              <>
                <div>Ничего не найдено</div>

                {suggestion && (
                  <p className="did-you-mean">
                    Возможно, вы имели в&nbsp;виду&nbsp;
                    <b
                      style={{ cursor: 'pointer', color: '#1677ff' }}
                      onClick={() =>{ setKeyword(suggestion); handleSearch(suggestion)}}
                    >
                      {suggestion}
                    </b>
                    ?
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="search-results">
                  {searchResults.map(mat => (
                    <div
                      key={mat.id}
                      className="material-item"
                      onClick={() =>
                        navigate(`/materials/${mat.id}`, {
                          state: { from: location.pathname + location.search }
                        })
                      }
                    >
                      <h3>{mat.title}</h3>
                      {/* snippet уже содержит <b>…</b> */}
                      <p dangerouslySetInnerHTML={{ __html: mat.snippet }} />
                      <div className="material-meta">
                        {mat.authorName} · {new Date(mat.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ─── пагинация ─── */}
                {totalPages > 1 && (
                  <div className="pagination-controls">
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
                      Назад
                    </button>
                    <span>{page + 1} / {totalPages}</span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      Вперёд
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── сетка категорий ─── */}
        <div className="card-grid">
          {categories.map(cat => (
            <div key={cat.id} className="category-card">
              <div className="category-header">
                <div className="card-icon" onClick={() => handleCategoryClick(cat.id)}>📂</div>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteCategory(cat.id)}
                  title="Удалить категорию"
                >
                  ✖
                </button>
              </div>
              <div className="card-title">{cat.name}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;
