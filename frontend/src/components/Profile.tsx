import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { profileStore } from '../stores/profileStore';

const vehicleTypeLabels: Record<string, string> = {
  sedan: 'Седан',
  suv: 'Внедорожник',
  hatchback: 'Хэтчбек',
  electric: 'Электро',
};

const Profile: React.FC = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const vehicleTypes = [
    { id: 'sedan', label: 'Седан', icon: '🚗' },
    { id: 'suv', label: 'Внедорожник', icon: '🚙' },
    { id: 'hatchback', label: 'Хэтчбек', icon: '🚕' },
    { id: 'electric', label: 'Электро', icon: '⚡' },
  ];

  useEffect(() => {
    profileStore.initBubbles();
  }, []);

  useEffect(() => {
    const state = location.state as { token?: string; refreshToken?: string; user?: unknown } | undefined;
    if (state?.token) {
      localStorage.setItem('token', state.token);
    }
    if (state?.refreshToken) {
      localStorage.setItem('refreshToken', state.refreshToken);
    }
    if (state?.token && state.user && typeof state.user === 'object') {
      try {
        localStorage.setItem('user', JSON.stringify(state.user));
      } catch (_) {}
    }
    const t = localStorage.getItem('token');
    if (!t) {
      navigate('/login');
      return;
    }
    void (async () => {
      const r = await profileStore.loadProfile();
      if (r === 'unauthorized') navigate('/login');
    })();
  }, [navigate, location.state]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await profileStore.saveProfile();
  };

  const handleCancelProfile = () => {
    profileStore.cancelProfileEdit();
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    await profileStore.saveCar();
  };

  const handleCancelCar = () => {
    profileStore.cancelCarEdit();
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await profileStore.savePassword();
  };

  const handleCancelPassword = () => {
    profileStore.cancelPasswordEdit();
  };

  if (profileStore.loadingUser) {
    return (
      <div className="profile-page">
        <div className="gray-bg" />
        <div className="profile-wrapper">
          <div className="profile-card">
            <p className="loading-text">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="gray-bg">
        {profileStore.bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="bubble"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`
            }}
          />
        ))}
      </div>

      <div className="profile-wrapper">
        <div className="profile-layout">
          {/* Боковой дашборд — только просмотр */}
          <aside className="profile-dashboard">
            <div className="logo-container">
              <div className="logo-circle">
                <svg width="56" height="56" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="15" y="20" width="40" height="30" rx="4" stroke="white" strokeWidth="3" fill="transparent" />
                  <path d="M28 30V40M42 30V40" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="25" cy="55" r="5" fill="white" />
                  <circle cx="45" cy="55" r="5" fill="white" />
                  <path d="M35 10V20M48 14L42 20M22 14L28 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  <rect x="35" y="30" width="4" height="10" fill="white" />
                </svg>
              </div>
              <div className="logo-text">
                <span className="logo-main">СИТИ</span>
                <span className="logo-highlight">ПАРК</span>
              </div>
            </div>
            <h2 className="dashboard-title">Мой профиль</h2>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Личные данные</h3>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => profileStore.openEditProfile()}
                  title="Редактировать"
                  aria-label="Редактировать"
                >
                  ✏️
                </button>
              </div>
              <dl className="dashboard-list">
                <div className="dashboard-row">
                  <dt>Имя</dt>
                  <dd>{profileStore.user?.name || '—'}</dd>
                </div>
                <div className="dashboard-row">
                  <dt>Email</dt>
                  <dd>{profileStore.email || '—'}</dd>
                </div>
              </dl>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Автомобиль</h3>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => profileStore.openEditCar()}
                  title="Редактировать"
                  aria-label="Редактировать"
                >
                  ✏️
                </button>
              </div>
              <dl className="dashboard-list">
                <div className="dashboard-row">
                  <dt>Тип</dt>
                  <dd>{profileStore.car ? vehicleTypeLabels[profileStore.car.type] || profileStore.car.type : '—'}</dd>
                </div>
                <div className="dashboard-row">
                  <dt>Номер</dt>
                  <dd>{profileStore.car?.auto_number || '—'}</dd>
                </div>
                <div className="dashboard-row">
                  <dt>Марка</dt>
                  <dd>{profileStore.car?.mark || '—'}</dd>
                </div>
                <div className="dashboard-row">
                  <dt>Цвет</dt>
                  <dd>{profileStore.car?.color || '—'}</dd>
                </div>
                {(profileStore.car?.notes ?? '').trim() ? (
                  <div className="dashboard-row">
                    <dt>Заметки</dt>
                    <dd>{profileStore.car?.notes}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Пароль</h3>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => profileStore.openEditPassword()}
                  title="Изменить пароль"
                  aria-label="Изменить пароль"
                >
                  ✏️
                </button>
              </div>
              <p className="dashboard-hint">Нажмите ✏️, чтобы сменить пароль</p>
            </div>

            <div className="dashboard-actions">
              <button type="button" className="btn-outline" onClick={() => navigate('/')}>
                ← Назад
              </button>
            </div>
          </aside>

          {/* Правая часть — форма редактирования или заглушка */}
          <main className="profile-content">
            {profileStore.error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {profileStore.error}
              </div>
            )}
            {profileStore.success && (
              <div className="success-message">
                <span className="success-icon">✓</span>
                {profileStore.success}
              </div>
            )}

            {profileStore.editPassword && (
              <div className="edit-panel">
                <h3 className="section-title">Смена пароля</h3>
                <form onSubmit={handleSavePassword}>
                  <div className="form-group">
                    <label>Текущий пароль</label>
                    <input
                      type="password"
                      value={profileStore.currentPassword}
                      onChange={(e) => profileStore.setCurrentPassword(e.target.value)}
                      placeholder="Введите текущий пароль"
                      className="form-input"
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Новый пароль</label>
                    <input
                      type="password"
                      value={profileStore.newPassword}
                      onChange={(e) => profileStore.setNewPassword(e.target.value)}
                      placeholder="Не менее 6 символов"
                      className="form-input"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Подтвердите новый пароль</label>
                    <input
                      type="password"
                      value={profileStore.confirmPassword}
                      onChange={(e) => profileStore.setConfirmPassword(e.target.value)}
                      placeholder="Повторите новый пароль"
                      className="form-input"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="edit-actions">
                    <button type="button" className="btn-outline" onClick={handleCancelPassword}>
                      Отмена
                    </button>
                    <button type="submit" className="submit-btn" disabled={profileStore.savingPassword}>
                      {profileStore.savingPassword ? 'Сохранение...' : 'Сохранить пароль'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {profileStore.editProfile && (
              <div className="edit-panel">
                <h3 className="section-title">Редактирование личных данных</h3>
                <form onSubmit={handleSaveProfile}>
                  <div className="form-group">
                    <label>Имя</label>
                    <input
                      type="text"
                      value={profileStore.name}
                      onChange={(e) => profileStore.setName(e.target.value)}
                      placeholder="Ваше имя"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={profileStore.email} readOnly className="form-input form-input-readonly" />
                  </div>
                  <div className="edit-actions">
                    <button type="button" className="btn-outline" onClick={handleCancelProfile}>
                      Отмена
                    </button>
                    <button type="submit" className="submit-btn" disabled={profileStore.savingProfile}>
                      {profileStore.savingProfile ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {profileStore.editCar && (
              <div className="edit-panel">
                <h3 className="section-title">Редактирование автомобиля</h3>
                <form onSubmit={handleSaveCar}>
                  <div className="form-group">
                    <label>Тип автомобиля</label>
                    <div className="vehicle-types">
                      {vehicleTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          className={`vehicle-type-btn ${profileStore.selectedVehicleType === type.id ? 'selected' : ''}`}
                          onClick={() => profileStore.setSelectedVehicleType(type.id)}
                        >
                          <span className="vehicle-icon">{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Номер автомобиля</label>
                    <input
                      type="text"
                      value={profileStore.autoNumber}
                      onChange={(e) => profileStore.setAutoNumber(e.target.value.toUpperCase())}
                      placeholder="А123ВС"
                      className="form-input"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Марка</label>
                      <input
                        type="text"
                        value={profileStore.mark}
                        onChange={(e) => profileStore.setMark(e.target.value)}
                        placeholder="Toyota Camry"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Цвет</label>
                      <input
                        type="text"
                        value={profileStore.color}
                        onChange={(e) => profileStore.setColor(e.target.value)}
                        placeholder="Черный"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Заметки</label>
                    <textarea
                      value={profileStore.notes}
                      onChange={(e) => profileStore.setNotes(e.target.value)}
                      placeholder="Дополнительно"
                      rows={2}
                      className="form-input form-textarea"
                    />
                  </div>
                  <div className="edit-actions">
                    <button type="button" className="btn-outline" onClick={handleCancelCar}>
                      Отмена
                    </button>
                    <button type="submit" className="submit-btn" disabled={profileStore.savingCar}>
                      {profileStore.savingCar ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!profileStore.editProfile && !profileStore.editCar && !profileStore.editPassword && (
              <>
                <div className="edit-placeholder">
                  <p>Нажмите ✏️ рядом с блоком в дашборде, чтобы отредактировать данные или пароль.</p>
                </div>

                <div className="profile-history-block">
                  {profileStore.sessions.filter(s => s.is_done_session !== 1 && new Date(s.time_end) >= new Date()).length > 0 && (
                    <div className="history-card">
                      <h3 className="history-card-title">Текущая сессия</h3>
                      {profileStore.sessions.filter(s => s.is_done_session !== 1 && new Date(s.time_end) >= new Date()).slice(0, 1).map((s) => (
                        <dl key={s.id_session} className="dashboard-list">
                          <div className="dashboard-row">
                            <dt>Место</dt>
                            <dd>№ {s.id_parking}</dd>
                          </div>
                          <div className="dashboard-row">
                            <dt>Начало</dt>
                            <dd>{new Date(s.time_start).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}</dd>
                          </div>
                          <div className="dashboard-row">
                            <dt>Окончание</dt>
                            <dd>{new Date(s.time_end).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}</dd>
                          </div>
                          <div className="dashboard-row">
                            <dt>Сумма</dt>
                            <dd>{s.price} ₽</dd>
                          </div>
                        </dl>
                      ))}
                    </div>
                  )}

                  <div className="history-card">
                    <h3 className="history-card-title">История бронирований</h3>
                    {profileStore.sessions.length === 0 ? (
                      <p className="dashboard-hint">Нет бронирований</p>
                    ) : (
                      <ul className="dashboard-sessions-list">
                        {profileStore.sessions.map((s) => {
                          const isInactive = s.is_done_session === 1 || new Date(s.time_end) < new Date();
                          return (
                            <li key={s.id_session} className={`dashboard-session-item ${isInactive ? 'inactive' : 'active'}`}>
                              <span className="session-place">Место №{s.id_parking}</span>
                              <span className="session-time">
                                {new Date(s.time_start).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })} – {new Date(s.time_end).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                              <span className="session-price">{s.price} ₽</span>
                              <span className="session-status">{isInactive ? 'Неактивна' : 'Активна'}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <style>{`
        .profile-page { min-height: 100vh; position: relative; overflow: hidden; padding: 20px; }
        .gray-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #b8c3d4; z-index: 1; overflow: hidden; }
        .bubble { position: absolute; bottom: -100px; background: rgba(37, 99, 235, 0.15); border-radius: 50%; pointer-events: none; animation: floatUp linear infinite; border: 2px solid rgba(37, 99, 235, 0.25); box-shadow: 0 0 40px rgba(37, 99, 235, 0.2); }
        @keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 0.9; } 100% { transform: translateY(-120vh) scale(1.3); opacity: 0.2; } }
        .profile-wrapper { position: relative; z-index: 10; width: 100%; max-width: 900px; margin: 0 auto; }
        .profile-layout { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
        .profile-dashboard { flex: 0 0 280px; background: white; border-radius: 24px; padding: 28px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.5); animation: cardAppear 0.5s ease-out; }
        @keyframes cardAppear { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .profile-content { flex: 1; min-width: 260px; background: white; border-radius: 24px; padding: 28px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.5); min-height: 200px; }
        .logo-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
        .logo-circle { width: 72px; height: 72px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; box-shadow: 0 10px 24px rgba(37, 99, 235, 0.3); border: 2px solid white; }
        .logo-text { font-size: 22px; font-weight: 700; }
        .logo-main { color: #1e293b; }
        .logo-highlight { color: #2563eb; }
        .dashboard-title { font-size: 20px; font-weight: 600; color: #1e293b; text-align: center; margin-bottom: 20px; }
        .dashboard-card { background: #f8fafc; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
        .dashboard-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .dashboard-card-title { font-size: 14px; font-weight: 600; color: #334155; margin: 0; }
        .btn-icon { background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px; opacity: 0.85; transition: opacity 0.2s; }
        .btn-icon:hover { opacity: 1; }
        .dashboard-list { margin: 0; padding: 0; list-style: none; }
        .dashboard-row { display: flex; flex-direction: column; gap: 2px; margin-bottom: 10px; }
        .dashboard-row:last-child { margin-bottom: 0; }
        .dashboard-row dt { font-size: 12px; color: #64748b; font-weight: 500; }
        .dashboard-row dd { font-size: 14px; color: #1e293b; margin: 0; }
        .dashboard-hint { font-size: 12px; color: #64748b; margin: 0; }
        .dashboard-sessions-list { list-style: none; margin: 0; padding: 0; }
        .dashboard-session-item { font-size: 12px; padding: 10px 12px; margin-bottom: 8px; background: white; border-radius: 10px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: center; }
        .dashboard-session-item.active { border-left: 4px solid #2563eb; }
        .dashboard-session-item.inactive { border-left: 4px solid #94a3b8; background: #f1f5f9; opacity: 0.9; }
        .dashboard-session-item.inactive .session-place,
        .dashboard-session-item.inactive .session-time { color: #64748b; }
        .dashboard-session-item.inactive .session-price { color: #64748b; }
        .dashboard-session-item.inactive .session-status { color: #94a3b8; font-style: italic; }
        .session-place { font-weight: 600; color: #334155; }
        .session-time { grid-column: 1 / -1; color: #64748b; }
        .session-price { font-weight: 600; color: #16a34a; }
        .session-status { font-size: 11px; color: #64748b; }
        .dashboard-actions { margin-top: 20px; }
        .error-message { background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .error-icon { font-size: 18px; }
        .success-message { background: #dcfce7; border: 1px solid #bbf7d0; color: #166534; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .success-icon { font-size: 18px; }
        .edit-panel { margin-top: 0; margin-left: auto; margin-right: auto; max-width: 320px; padding: 24px; box-sizing: border-box; }
        .edit-panel form { display: flex; flex-direction: column; gap: 0; }
        .section-title { font-size: 15px; font-weight: 600; color: #334155; margin-bottom: 12px; }
        .form-group { margin-bottom: 12px; margin-left: 0; margin-right: 0; }
        .form-group label { display: block; margin-bottom: 4px; color: #4b5563; font-size: 13px; font-weight: 500; }
        .form-input { width: 100%; max-width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; background: #f8fafc; transition: all 0.2s; }
        .form-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); }
        .form-input-readonly { background: #f1f5f9; color: #64748b; cursor: default; }
        .form-textarea { resize: vertical; font-family: inherit; min-height: 48px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
        .form-row .form-group { margin-bottom: 0; }
        .vehicle-types { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .vehicle-type-btn { padding: 6px 4px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; color: #4b5563; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .vehicle-type-btn:hover { border-color: #2563eb; background: #f0f4ff; }
        .vehicle-type-btn.selected { border-color: #2563eb; background: rgba(37, 99, 235, 0.1); color: #2563eb; }
        .vehicle-icon { font-size: 16px; }
        .submit-btn { padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .submit-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .edit-actions { display: flex; gap: 12px; margin-top: 12px; }
        .btn-outline { padding: 8px 16px; background: white; border: 1px solid #2563eb; color: #2563eb; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-outline:hover { background: #f0f4ff; }
        .edit-placeholder { color: #64748b; font-size: 14px; padding: 24px 0; text-align: center; }
        .profile-history-block { margin-top: 24px; }
        .history-card { background: #f8fafc; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
        .history-card-title { font-size: 14px; font-weight: 600; color: #334155; margin: 0 0 12px 0; }
        .loading-text { text-align: center; color: #64748b; padding: 40px; }
        @media (max-width: 768px) { .profile-layout { flex-direction: column; } .profile-dashboard { flex: 1 1 auto; width: 100%; } .edit-panel { max-width: 100%; } .form-row { grid-template-columns: 1fr; } .form-row .form-group { margin-bottom: 12px; } .form-row .form-group:last-child { margin-bottom: 0; } .vehicle-types { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
});

export default Profile;
