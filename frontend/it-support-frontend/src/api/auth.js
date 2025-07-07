import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/sign-in`, { email, password });
    return response.data;
};

export const register = async (username, email, password) => {
    const response = await axios.post(`${API_URL}/auth/sign-up`, {
        username,
        email,
        password
    });
    return response.data;
};