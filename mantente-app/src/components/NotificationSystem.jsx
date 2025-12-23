import React, { useState, useEffect } from 'react';
import { pb } from '../pocketbase';
import { toast } from 'react-toastify';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!pb.authStore.model?.id) return;

    // Cargar notificaciones iniciales
    loadNotifications();

    // Suscripción en tiempo real
    let unsubscribeFunc;

    const subscribe = async () => {
      try {
        unsubscribeFunc = await pb.collection('notifications').subscribe('*', (e) => {
          if (e.action === 'create' && e.record.user_id === pb.authStore.model.id) {
            setNotifications(prev => [e.record, ...prev]);
            setUnreadCount(prev => prev + 1);
            toast.info(e.record.title);
          }
        });
      } catch (error) {
        console.error("Error subscribing to notifications:", error);
      }
    };

    subscribe();

    return () => {
      if (unsubscribeFunc) {
        unsubscribeFunc();
      } else {
        // Fallback cleanup if unsubscribeFunc wasn't set yet or failed
        pb.collection('notifications').unsubscribe('*').catch(console.error);
      }
    };
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
    <>
      <button
        className="btn btn-outline-primary position-relative"
        type="button"
        onClick={() => setShowModal(true)}
        title="Notificaciones"
      >
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>

      {showModal && (
        <div className="notification-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="notification-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="notification-modal-header">
              <h5>Notificaciones</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="notification-modal-body">
              {unreadCount > 0 && (
                <div className="notification-actions">
                  <button className="btn btn-sm btn-outline-primary" onClick={markAllAsRead}>
                    Marcar todas como leídas
                  </button>
                </div>
              )}
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="notification-header">
                        <small className="notification-date">
                          {new Date(notification.created).toLocaleDateString()}
                        </small>
                        {!notification.is_read && <span className="badge bg-primary">Nuevo</span>}
                      </div>
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationSystem;