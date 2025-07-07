import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './styles/EditMaterialPage.css';

const CreateCategoryPage = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');

    try {
      await axios.post('http://localhost:8080/categories', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/home');
    } catch (err) {
      setError('Ошибка при создании категории');
    }
  };

  return (
    <>
      <Navbar />
      <div className="edit-material-wrapper">
        <h2>Добавление категории</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="edit-form">
          <label>Название категории</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit">Создать категорию</button>
        </form>
      </div>
    </>
  );
};

export default CreateCategoryPage;
