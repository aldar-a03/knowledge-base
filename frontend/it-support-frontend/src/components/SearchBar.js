// SearchBar.js
import React from 'react';
import './styles/SearchBar.css';

const SearchBar = ({ onSearch, alignLeft, value, onChange }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (value.trim()) {
            onSearch(value);
        }
    };

    return (
        <form className={`search-bar ${alignLeft ? 'align-left' : ''}`} onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Введите ключевые слова..."
                value={value}                     // ← привязка к keyword из HomePage
                onChange={(e) => onChange(e.target.value)}  // ← обновление из HomePage
            />
            <button type="submit">Поиск</button>
        </form>
    );
};

export default SearchBar;
