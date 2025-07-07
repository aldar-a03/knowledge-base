import React, { useState } from 'react';
import axios from 'axios';
import './styles/LoginPage.css';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/auth/sign-up', {
                username,
                email,
                password
            });
            setErrorMessage('');
            setSuccessMessage('Регистрация прошла успешно!');
            setTimeout(() => {
                window.location.href = '/'; // переход на логин
            }, 1500);
        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage('Ошибка регистрации: проверьте введённые данные');
            } else {
                setErrorMessage('Ошибка соединения с сервером');
            }
            setSuccessMessage('');
        }
    };

    return (
        <div className="login-container">
            <h2>Регистрация</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="ФИО"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        setErrorMessage('');
                    }}
                    required
                />
                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMessage('');
                    }}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage('');
                    }}
                    required
                />
                <button type="submit">Зарегистрироваться</button>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
            </form>
        </div>
    );
}

export default RegisterPage;
