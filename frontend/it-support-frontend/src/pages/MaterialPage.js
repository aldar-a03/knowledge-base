import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './styles/MaterialPage.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CommentSection from '../components/CommentSection';



const MaterialPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [material, setMaterial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8080/materials/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setMaterial(response.data);
            } catch (err) {
                setError('Не удалось загрузить материал');
            } finally {
                setLoading(false);
            }
        };

        fetchMaterial();
    }, [id]);

    const handleBack = () => {
        const fallback = '/home';
        const backTo = location.state?.from || fallback;
        navigate(backTo);
    };

    const handleEdit = () => {
        navigate(`/materials/${id}/edit`, {
            state: {
                from: location.state?.from || `/materials/${id}`
            }
        });
    };

    const handleDelete = () => {
        confirmAlert({
            title: 'Подтверждение удаления',
            message: 'Вы уверены, что хотите удалить этот материал?',
            buttons: [
                {
                    label: 'Удалить',
                    onClick: async () => {
                        try {
                            const token = localStorage.getItem('token');
                            await axios.delete(`http://localhost:8080/materials/${id}?confirm=true`, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });
                            toast.success('Материал успешно удалён');
                            setTimeout(() => {
                                navigate('/home');
                            }, 1500); 
                        } catch (err) {
                            toast.error('Ошибка при удалении материала');
                        }
                    }
                },
                {
                    label: 'Отмена',
                    onClick: () => {}
                }
            ]
        });
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <Navbar />
            <div className="material-container">
                <h1>{material.title}</h1>
                <div className="material-meta">
                    <span>Автор: {material.authorName}</span>
                    <span>Создан: {new Date(material.createdAt).toLocaleDateString()}</span>
                    {material.updatedAt && <span>Обновлен: {new Date(material.updatedAt).toLocaleDateString()}</span>}
                </div>
                <div className="material-categories">
                    Категории: {material.categoryNames.join(', ')}
                </div>
                <div
                className="material-content"
                dangerouslySetInnerHTML={{ __html: material.content }}
                />

                {material.attachments && material.attachments.length > 0 && (
                <div className="material-attachments">
                    <h3>Вложения</h3>
                    <ul>
                    {material.attachments
                        .filter((att) => !att.contentType.startsWith('image/')) // исключаем картинки
                        .map((att) => (
                        <li key={att.id}>
                            <a
                            href={`http://localhost:8080/materials/attachments/${att.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                            {att.originalName}
                            </a>
                        </li>
                        ))}
                    </ul>
                </div>
                )}



                <div className="material-buttons">
                <button onClick={handleBack}>Назад</button>
                <button onClick={handleEdit}>Редактировать</button>
                <button onClick={handleDelete} className="delete-btn">Удалить</button>
                </div>
                <CommentSection materialId={id} />
            </div>
            <ToastContainer position="top-center" autoClose={1500} />
        </>
    );
};

export default MaterialPage;
