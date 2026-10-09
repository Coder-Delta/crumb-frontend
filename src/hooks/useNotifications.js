import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api.js';

const apiUrl = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
const socketUrl = apiUrl.replace(/\/api\/?$/, '') || window.location.origin;

export function useNotifications(user, toast) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotification, setLastNotification] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('crumb-token');
    const userId = user?.id || user?._id;
    if (!userId || !token) {
      setNotifications([]);
      setUnreadCount(0);
      setLastNotification(null);
      return undefined;
    }

    let active = true;
    let hasConnected = false;
    let cleanupSocket = () => {};
    setNotifications([]);
    setUnreadCount(0);
    setLastNotification(null);
    const loadNotifications = async () => {
      try {
        const { data } = await api.get('/notifications', { params: { limit: 30 } });
        if (active) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch {
        // A failed notification request should not interrupt ordering or account access.
      }
    };

    void loadNotifications().then(() => {
      if (!active) return;
      const socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
      });
      socket.on('notification:new', (notification) => {
        setNotifications((current) =>
          [notification, ...current.filter((item) => item._id !== notification._id)].slice(0, 30),
        );
        setUnreadCount((count) => count + 1);
        setLastNotification(notification);
        toast(notification.message, 'success');
      });
      socket.on('connect', () => {
        if (hasConnected) void loadNotifications();
        hasConnected = true;
      });
      cleanupSocket = () => socket.disconnect();
    });

    return () => {
      active = false;
      cleanupSocket();
    };
  }, [user?.id, user?._id, toast]);

  const markAsRead = useCallback(
    async (id) => {
      const wasUnread = notifications.some((item) => item._id === id && !item.readAt);
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) => {
          if (notification._id !== id || notification.readAt) return notification;
          return { ...notification, readAt };
        }),
      );
      if (wasUnread) setUnreadCount((count) => Math.max(0, count - 1));
      try {
        await api.patch(`/notifications/${id}/read`);
      } catch {
        // The next notification refresh will restore the server's read state.
      }
    },
    [notifications],
  );

  const markAllAsRead = useCallback(async () => {
    const readAt = new Date().toISOString();
    setNotifications((current) => current.map((item) => ({ ...item, readAt })));
    setUnreadCount(0);
    try {
      await api.patch('/notifications/read-all');
    } catch {
      // Keep the interface responsive; a later refresh reconciles server state.
    }
  }, []);

  return { notifications, unreadCount, lastNotification, markAsRead, markAllAsRead };
}
