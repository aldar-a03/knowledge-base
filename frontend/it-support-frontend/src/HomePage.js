import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/HomePage.css';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Ошибка загрузки категорий:', err));
  }, []);

  const handleDeleteCategory = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:8080/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Ошибка удаления категории:', err);
    }
  };

  return (
    <div className="card-grid">
      {categories.map(cat => (
        <div key={cat.id} className="category-card">
        <div className="category-content" onClick={() => navigate(`/category/${cat.id}`)}>
          <span>{cat.name}</span>
        </div>
        <button
          className="delete-button"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteCategory(cat.id);
          }}
        >
          ✖
        </button>
      </div>
      
      
      ))}
    </div>
  );
};

export default HomePage;
