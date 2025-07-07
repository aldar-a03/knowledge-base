import React, { useState } from 'react';
import axios from 'axios';
import './styles/LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅ подключаем контекст

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth(); // ✅ используем login из контекста

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/auth/sign-in', {
                email,
                password
            });

            console.log('Ответ от сервера:', response.data); // 🔍 лог для отладки

            login(response.data.token); // ✅ сохраняем токен через контекст
            console.log('Токен сохранён в контексте, переход на /home');

            navigate('/home'); // ✅ переход
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            setErrorMessage('Неверный email или пароль');
        }
    };

    return (
        <div className="login-container">
            <h2>Добро пожаловать!</h2>
            <form onSubmit={handleLogin}>
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
                <button type="submit">Войти</button>
                {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                )}
            </form>
            <div className="links">
                <a href="#">Забыли пароль?</a>
            </div>

<p className="login-note">
  Нажимая «Войти», вы принимаете <span className="highlight">пользовательское соглашение</span> и <span className="highlight">политику конфиденциальности</span>
</p>
        </div>
    );
}

export default LoginPage;
