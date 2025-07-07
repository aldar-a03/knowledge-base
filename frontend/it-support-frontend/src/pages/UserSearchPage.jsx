import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/UserSearchPage.css';
import Navbar from '../components/Navbar';
import { FaUser } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const UserSearchPage = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // при первом заходе читаем keyword из URL
  useEffect(() => {
  handleSearch('');
  }, []);

  const handleSearch = async (searchTerm = keyword) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/users/search', {
        params: searchTerm ? { keyword: searchTerm } : {},
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data);
      if (searchTerm) {
        navigate(`/users/search?keyword=${encodeURIComponent(searchTerm)}`);
      }
    } catch (err) {
      console.error('Ошибка при поиске пользователей:', err);
      setResults([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <Navbar />
      <div className="user-search-wrapper">
        <h2>Поиск пользователей</h2>
        <div className="search-bar">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите имя или email"
          />
          <button onClick={() => handleSearch()}>Поиск</button>
        </div>

        <div className="user-list">
          {searchPerformed && results.length === 0 ? (
            <p>Ничего не найдено</p>
          ) : (
            results.map((user) => (
              <div
                key={user.id}
                className="user-card"
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <FaUser className="user-icon" />
                <span>{user.fullName}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default UserSearchPage;
