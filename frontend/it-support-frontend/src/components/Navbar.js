import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './styles/Navbar.css';
import { FaPlusCircle, FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';


const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleAddMaterial = () => {
        setIsDropdownOpen(false);
        navigate('/materials/create');
    };

    const handleAddCategory = () => {
        setIsDropdownOpen(false);
        navigate('/categories/create'); // ⚠️ Убедись, что такой маршрут существует
    };

    return (
        <div className="navbar">
            <div className="navbar-left">
            <Link to="/home" className="logo">IT Support System</Link>
            </div>
            <div className="navbar-right">

                <div className="dropdown-container">
                    <button className="icon-button" onClick={() => setIsDropdownOpen(prev => !prev)} title="Создать" style={{ marginTop: '5px' }}>
                        <FaPlusCircle size={20} color="black" />
                    </button>

                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <button onClick={handleAddMaterial}>Добавить материал</button>
                            <button onClick={handleAddCategory}>Добавить категорию</button>
                             <button onClick={() => setIsDropdownOpen(false)}>Добавить пользователя</button>
                        </div>
                    )}
                </div>
                <button
                className="icon-button"
                title="Поиск пользователей"
                onClick={() => navigate('/users/search')}
                style={{ marginTop: '5px', marginLeft: '10px' }}
                >
                <FaSearch size={20} color="black" />
                </button>   
                <FaUserCircle size={20} style={{ marginLeft: '12px', verticalAlign: 'middle' }} />
                <span
                    className="user-name clickable"
                    onClick={() => navigate(`/profile/${user?.id}`)}
                    title="Перейти в профиль"
                    >
                    Привет, {user?.fullName}
                </span>

                <button className="logout-button" onClick={logout}>Выйти</button>
            </div>
        </div>
    );
};

export default Navbar;
