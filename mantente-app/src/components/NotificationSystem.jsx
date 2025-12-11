import React, { useState, useEffect } from 'react';
import { pb } from '../pocketbase';
import { toast } from 'react-toastify';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!pb.authStore.model?.id) return;

    // Cargar notificaciones iniciales
    loadNotifications();

    // Suscripción en tiempo real
    const unsubscribe = pb.collection('notifications').subscribe('*', (e) => {
      if (e.action === 'create' && e.record.user_id === pb.authStore.model.id) {
        setNotifications(prev => [e.record, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.info(e.record.title);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadNotifications = async () => {
    try {
      const records = await pb.collection('notifications').getFullList({
        filter: `user_id='${pb.authStore.model.id}'`,
        sort: '-created'
      });
      setNotifications(records);
      setUnreadCount(records.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await pb.collection('notifications').update(id, { is_read: true });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      for (const n of unread) {
        await pb.collection('notifications').update(n.id, { is_read: true });
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-primary position-relative"
        type="button"
        id="notificationDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>
      <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: '300px' }}>
        <li className="dropdown-header d-flex justify-content-between align-items-center">
          Notificaciones
          {unreadCount > 0 && (
            <button className="btn btn-sm btn-link p-0" onClick={markAllAsRead}>
              Marcar todas como leídas
            </button>
          )}
        </li>
        <li><hr className="dropdown-divider" /></li>
        {notifications.length === 0 ? (
          <li className="dropdown-item text-muted">No hay notificaciones</li>
        ) : (
          notifications.slice(0, 5).map(notification => (
            <li key={notification.id}>
              <div
                className={`dropdown-item ${!notification.is_read ? 'fw-bold' : ''}`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                style={{ cursor: !notification.is_read ? 'pointer' : 'default' }}
              >
                <div className="d-flex justify-content-between">
                  <small className="text-muted">
                    {new Date(notification.created).toLocaleDateString()}
                  </small>
                  {!notification.is_read && <span className="badge bg-primary">Nuevo</span>}
                </div>
                <div>{notification.title}</div>
                <small className="text-muted">{notification.message}</small>
              </div>
            </li>
          ))
        )}
        {notifications.length > 5 && (
          <li><hr className="dropdown-divider" /></li>
        )}
        <li className="dropdown-item text-center">
          <button className="btn btn-link p-0">Ver todas las notificaciones</button>
        </li>
      </ul>
    </div>
  );
};

export default NotificationSystem;