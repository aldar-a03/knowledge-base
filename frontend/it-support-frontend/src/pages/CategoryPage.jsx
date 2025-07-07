import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/CategoryPage.css';
import Navbar from '../components/Navbar';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMaterials = async (pageNum = 0) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/materials/by-category/${categoryId}`, {
        params: { page: pageNum, size: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });

      setMaterials(response.data.content);
      setPage(response.data.number);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [categoryId]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchMaterials(newPage);
    }
  };

  return (
    <>
      <Navbar />
      <div className="category-page-wrapper">
        <h2>Материалы по категории</h2>

        {materials.length === 0 ? (
          <p className="no-materials">В этой категории пока нет материалов.</p>
        ) : (
          materials.map((mat) => (
            <div
              key={mat.id}
              className="material-item"
              onClick={() => navigate(`/materials/${mat.id}`)}
            >
              <h3>{mat.title}</h3>
              <p>{mat.previewText}</p>
              <div className="material-meta">
                {mat.authorName} · {new Date(mat.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}

        {totalPages > 0 && (
          <div className="pagination-controls">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
              Назад
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1}>
              Вперёд
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryPage;
