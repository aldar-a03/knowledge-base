import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { FaUserCircle, FaEdit } from 'react-icons/fa';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './styles/UserProfilePage.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';


// После импортов
// вверху файла, после import React...
function BlockUserConfirmation({ actionLabel, onConfirm, onClose }) {
  const [removeMaterials, setRemoveMaterials] = React.useState(false);
  const [removeComments, setRemoveComments] = React.useState(false);

  return (
    <div className="react-confirm-alert">
      <div className="react-confirm-alert-body">
        <h1>Подтверждение действия</h1>
        <p>
          Вы уверены, что хотите <b>{actionLabel}</b> этого пользователя?
        </p>

        <div style={{ margin: "1em 0" }}>
          <label style={{ display: "block", marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={removeMaterials}
              onChange={e => setRemoveMaterials(e.target.checked)}
            />{" "}
            Удалить материалы пользователя
          </label>
          <label style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={removeComments}
              onChange={e => setRemoveComments(e.target.checked)}
            />{" "}
            Удалить комментарии пользователя
          </label>
        </div>

        <div style={{ textAlign: "right" }}>
          <button
            onClick={() => {
              onConfirm(removeMaterials, removeComments);
              onClose();
            }}
            style={{ marginRight: 8 }}
          >
            {actionLabel}
          </button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}

const getRoleLabel = (role) => {
  switch (role) {
    case 'ROLE_ADMIN':
      return 'Администратор';
    case 'ROLE_USER':
      return 'Пользователь';
    case 'ROLE_READER':
      return 'Читатель';
    default:
      return 'Неизвестно';
  }
};

const UserProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const [isEditingRole, setIsEditingRole] = useState(false);
  const [newRole, setNewRole] = useState('');

  const canEditName = currentUser?.id === Number(id) || currentUser?.role === 'ROLE_ADMIN';
  const canEditRole = currentUser?.role === 'ROLE_ADMIN' && currentUser?.id !== Number(id);

  const navigate = useNavigate();
  const location = useLocation();

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [removeMaterials, setRemoveMaterials] = useState(false);
  const [removeComments, setRemoveComments] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setNewName(response.data.fullName);
        setNewRole(response.data.role);
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Новый пароль и подтверждение не совпадают');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/users/${id}/password`, {
        oldPassword,
        newPassword,
        confirmPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Пароль успешно изменён');
      setShowPasswordFields(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Ошибка смены пароля:', err);
      alert('Не удалось сменить пароль');
    }
  };
  

  const handleSaveName = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/users/${id}/name`, { fullName: newName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...user, fullName: newName });
      setIsEditingName(false);
    } catch (err) {
      console.error('Ошибка изменения имени:', err);
    }
  };

  const handleSaveRole = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/users/${id}/role`, { newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...user, role: newRole });
      setIsEditingRole(false);
    } catch (err) {
      console.error('Ошибка изменения роли:', err);
    }
  };

const handleToggleBlock = () => {
  const isCurrentlyBlocked = user.blocked;
  const actionLabel = isCurrentlyBlocked ? 'Разблокировать' : 'Заблокировать';

  confirmAlert({
    customUI: ({ onClose }) => {
      // 1) Если это разблокировка — простой confirm без чекбоксов
      if (isCurrentlyBlocked) {
        return (
          <div className="react-confirm-alert">
            <div className="react-confirm-alert-body">
              <h1>Подтверждение действия</h1>
              <p>
                Вы уверены, что хотите <b>{actionLabel}</b> этого пользователя?
              </p>
              <div style={{ textAlign: 'right', marginTop: 20 }}>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    await axios.patch(
                      `http://localhost:8080/api/admin/users/${user.id}/unblock`,
                      null,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setUser(u => ({ ...u, blocked: false }));
                    onClose();
                  }}
                  style={{ marginRight: 8 }}
                >
                  {actionLabel}
                </button>
                <button onClick={onClose}>Отмена</button>
              </div>
            </div>
          </div>
        );
      }

      // 2) Если это блокировка — показываем чекбоксы
      return (
        <BlockUserConfirmation
          actionLabel={actionLabel}
          onClose={onClose}
          onConfirm={async (removeMaterials, removeComments) => {
            const token = localStorage.getItem('token');
            await axios.patch(
              `http://localhost:8080/api/admin/users/${user.id}/block`,
              null,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(u => ({ ...u, blocked: true }));
            console.log('Удалить материалы?', removeMaterials);
            console.log('Удалить комментарии?', removeComments);
            onClose();
          }}
        />
      );
    }
  });
};





  if (loading) return <div>Загрузка...</div>;
  if (!user) return <div>Пользователь не найден</div>;

  return (
    <>
      <Navbar />
      <div className="profile-page-wrapper">
        <div className="profile-header">
          <FaUserCircle className="profile-icon" />
          {isEditingName ? (
            <>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button onClick={handleSaveName}>Сохранить</button>
            </>
          ) : (
            <h2>
              {user.fullName}{' '}
              {canEditName && <FaEdit className="edit-icon" onClick={() => setIsEditingName(true)} />}
            </h2>
          )}
        </div>
        <div className="profile-info">
<p>
  <strong>Email:</strong> {user.email} <FaEdit className="edit-icon" />
</p>
          <p>
            <strong>Роль:</strong>{' '}
            {isEditingRole ? (
              <>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                  <option value="ROLE_USER">Пользователь</option>
                  <option value="ROLE_READER">Читатель</option>
                  <option value="ROLE_ADMIN">Администратор</option>
                </select>
                <button onClick={handleSaveRole}>Сохранить</button>
              </>
            ) : (
              <>
                {getRoleLabel(user.role)}{' '}
                {canEditRole && <FaEdit className="edit-icon" onClick={() => setIsEditingRole(true)} />}
              </>
            )}
          </p>
          <p><strong>Дата регистрации:</strong> {new Date(user.registeredAt).toLocaleDateString()}</p>
          <p>
            <span
              onClick={() => navigate(`/users/${user.id}/materials`)}
              style={{ cursor: 'pointer' }}
            >
              <strong>Материалов:</strong> {user.materialCount}
            </span>
          </p>

          <p><strong>Комментариев:</strong> {user.commentCount}</p>
        </div>
        
        {currentUser?.role === 'ROLE_ADMIN' &&
        currentUser.id !== user.id &&
        user.role !== 'ROLE_ADMIN' && (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={handleToggleBlock}
              className="block-user-button"
              style={{
                backgroundColor: user.blocked ? '#4caf50' : '#f44336',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {user.blocked ? 'Разблокировать' : 'Заблокировать'}
            </button>
          </div>
      )}

        {currentUser?.id === Number(id) && (
        <div className="change-password-section">
          <button onClick={() => setShowPasswordFields(prev => !prev)} className="change-password-button">
            Сменить пароль
          </button>
          {showPasswordFields && (
            <div className="password-form">
              <input
                type="password"
                placeholder="Старый пароль"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Новый пароль"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Подтвердите новый пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button onClick={handleChangePassword}>Сохранить пароль</button>
            </div>
          )}
        </div>
        )}

      </div>
    </>
  );
};

export default UserProfilePage;
