// src/components/CommentSection.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/CommentSection.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const CommentSection = ({ materialId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/comments/material/${materialId}`);
      setComments(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке комментариев:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [materialId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/comments', {
        materialId,
        text
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setText('');
      toast.success('Комментарий добавлен');
      fetchComments();
    } catch (err) {
      console.error('Ошибка при добавлении комментария:', err);
      toast.error('Не удалось добавить комментарий');
    }
  };

  const handleDelete = (commentId) => {
    confirmAlert({
      title: 'Подтверждение удаления',
      message: 'Вы уверены, что хотите удалить комментарий?',
      buttons: [
        {
          label: 'Да',
          onClick: async () => {
            try {
              const token = localStorage.getItem('token');
              await axios.delete(`http://localhost:8080/comments/${commentId}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              toast.success('Комментарий удалён');
              fetchComments();
            } catch (err) {
              console.error('Ошибка при удалении комментария:', err);
              toast.error('Не удалось удалить комментарий');
            }
          }
        },
        {
          label: 'Отмена'
        }
      ]
    });
  };

  return (
    <div className="comment-section">
      <h3>Комментарии</h3>

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напишите комментарий..."
          rows={3}
          maxLength={140}
        ></textarea>
        <button type="submit">Отправить</button>
      </form>

      <div className="comment-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <strong>{comment.authorName}</strong>
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
              {(comment.author || comment.admin) && (
              <button className="delete-comment" onClick={() => handleDelete(comment.id)}>Удалить</button>
            )}
            </div>
            <p>{comment.text}</p>
          </div>
        ))}
      </div>
      

    </div>
  );
};

export default CommentSection;
