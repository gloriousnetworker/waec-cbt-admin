// src/hooks/useNotifications.js — NOTIF-1: Push notifications hook
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function useNotifications(fetchWithAuth, baseEndpoint = '/admin') {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permissionState, setPermissionState] = useState('default');
  const tokenSavedRef = useRef(false);
  const messagingRef = useRef(null);

  // Fetch in-app notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!fetchWithAuth) return;
    try {
      const res = await fetchWithAuth(`${baseEndpoint}/notifications`);
      if (res?.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (_) {}
  }, [fetchWithAuth, baseEndpoint]);

  // Save FCM token to backend
  const saveToken = useCallback(async (token) => {
    if (!fetchWithAuth || tokenSavedRef.current) return;
    try {
      await fetchWithAuth(`${baseEndpoint}/notifications/token`, {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      tokenSavedRef.current = true;
    } catch (_) {}
  }, [fetchWithAuth, baseEndpoint]);

  // Request browser permission + init FCM
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission !== 'granted') return;

      // Dynamic import to avoid SSR issues
      const { getFirebaseMessaging } = await import('../lib/firebase');
      const { getToken, onMessage } = await import('firebase/messaging');

      const messaging = await getFirebaseMessaging();
      if (!messaging) return;
      messagingRef.current = messaging;

      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) await saveToken(token);

      // Handle foreground messages
      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {};
        if (title) {
          toast(
            (t) => (
              <div onClick={() => toast.dismiss(t.id)}>
                <p className="font-semibold text-sm">{title}</p>
                {body && <p className="text-xs text-gray-500 mt-0.5">{body}</p>}
              </div>
            ),
            { icon: '🔔', duration: 5000 }
          );
        }
        // Refresh notification list
        fetchNotifications();
      });
    } catch (err) {
      console.error('Notification setup error:', err.message);
    }
  }, [saveToken, fetchNotifications]);

  // Mark one notification as read
  const markRead = useCallback(async (notificationId) => {
    try {
      await fetchWithAuth?.(`${baseEndpoint}/notifications/${notificationId}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (_) {}
  }, [fetchWithAuth, baseEndpoint]);

  // Mark all notifications as read
  const markAllRead = useCallback(async () => {
    try {
      await fetchWithAuth?.(`${baseEndpoint}/notifications/read-all`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (_) {}
  }, [fetchWithAuth, baseEndpoint]);

  // Initial load + auto-init if already granted
  useEffect(() => {
    if (!fetchWithAuth) return;
    fetchNotifications();

    if (typeof window !== 'undefined' && 'Notification' in window) {
      const current = Notification.permission;
      setPermissionState(current);
      if (current === 'granted') {
        requestPermission();
      }
    }
  }, [fetchWithAuth]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    notifications,
    unreadCount,
    permissionState,
    requestPermission,
    markRead,
    markAllRead,
    fetchNotifications,
  };
}
