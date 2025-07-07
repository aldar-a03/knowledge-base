import axios from 'axios';

export const getAllCategories = async () => {
    const response = await axios.get('http://localhost:8080/categories');
    return response.data;
};
