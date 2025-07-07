import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './styles/CategoryPage.css'; // Переиспользуем стили

const UserMaterialsPage = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMaterials = async (pageNum = 0) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/materials/user/${userId}`, {
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
  }, [userId]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchMaterials(newPage);
    }
  };

  return (
    <>
      <Navbar />
      <div className="category-page-wrapper">
        <h2>Материалы пользователя</h2>

        {materials.length === 0 ? (
          <p className="no-materials">У пользователя пока нет материалов.</p>
        ) : (
          materials.map((mat) => (
            <div
              key={mat.id}
              className="material-item"
              onClick={() => navigate(`/materials/${mat.id}`)}
            >
              <h3>{mat.title}</h3>
              <p>{mat.previewText || mat.content}</p>
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

export default UserMaterialsPage;
