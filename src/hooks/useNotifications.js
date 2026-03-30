// src/hooks/useNotifications.js — NOTIF-1: Real-time push + in-app notifications
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const POLL_INTERVAL = 30_000; // 30-second polling fallback

// Type → display config for richer toasts
const NOTIF_ICON = {
  exam_started:       '🚀',
  exam_submitted:     '📋',
  exam_malpractice:   '🚨',
  exam_violation:     '⚠️',
  new_ticket:         '🎫',
  ticket_reply:       '💬',
  exam_created:       '📝',
  student_registered: '👤',
  feedback:           '⭐',
  default:            '🔔',
};

export function useNotifications(fetchWithAuth, baseEndpoint = '/admin', userId = null) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permissionState, setPermissionState] = useState('default');
  const tokenSavedRef = useRef(false);
  const messagingRef = useRef(null);
  const unsubscribeFirestoreRef = useRef(null);
  const isInitialSnapshotRef = useRef(true);
  const knownIdsRef = useRef(new Set());

  // ── Fetch in-app notifications from backend (polling fallback) ────────────
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

  // ── Save FCM token to backend ─────────────────────────────────────────────
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

  // ── Show an in-app toast for a new notification ───────────────────────────
  const showToast = useCallback((notif) => {
    const icon = NOTIF_ICON[notif.type] || NOTIF_ICON.default;
    const url = notif.data?.url || (notif.data?.section ? `/dashboard?section=${notif.data.section}` : null);
    toast(
      (t) => (
        <div
          onClick={() => {
            toast.dismiss(t.id);
            if (url && typeof window !== 'undefined') window.location.href = url;
          }}
          style={{ cursor: url ? 'pointer' : 'default' }}
        >
          <p className="font-semibold text-sm">{notif.title}</p>
          {notif.body && <p className="text-xs text-gray-500 mt-0.5">{notif.body}</p>}
          {url && <p className="text-xs text-brand-primary mt-1 font-medium">Tap to view →</p>}
        </div>
      ),
      { icon, duration: 6000 }
    );
  }, []);

  // ── Firestore real-time listener ──────────────────────────────────────────
  const startFirestoreListener = useCallback(async (uid) => {
    if (!uid) return;
    try {
      const { getFirebaseFirestore } = await import('../lib/firebase');
      const { collection, query, where, orderBy, limit, onSnapshot } = await import('firebase/firestore');

      const db = getFirebaseFirestore();
      if (!db) return;

      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(30)
      );

      isInitialSnapshotRef.current = true;

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt,
          };
        });

        setNotifications(docs);
        setUnreadCount(docs.filter(n => !n.read).length);

        if (isInitialSnapshotRef.current) {
          docs.forEach(d => knownIdsRef.current.add(d.id));
          isInitialSnapshotRef.current = false;
          return;
        }

        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const notif = { id: change.doc.id, ...change.doc.data() };
            if (!knownIdsRef.current.has(notif.id) && !notif.read) {
              knownIdsRef.current.add(notif.id);
              showToast(notif);
            }
          }
        });
      }, (err) => {
        console.warn('Firestore listener error (falling back to polling):', err.message);
      });

      unsubscribeFirestoreRef.current = unsubscribe;
    } catch (err) {
      console.warn('Could not start Firestore listener:', err.message);
    }
  }, [showToast]);

  // ── Request browser permission + init FCM ────────────────────────────────
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission !== 'granted') return;

      const { getFirebaseMessaging } = await import('../lib/firebase');
      const { getToken, onMessage } = await import('firebase/messaging');

      const messaging = await getFirebaseMessaging();
      if (!messaging) return;
      messagingRef.current = messaging;

      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) await saveToken(token);

      // Foreground FCM — Firestore listener handles list refresh automatically
      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {};
        const data = payload.data || {};
        if (title) showToast({ title, body, type: data.type, data });
      });
    } catch (err) {
      console.error('Notification setup error:', err.message);
    }
  }, [saveToken, showToast]);

  // ── Mark one notification as read ─────────────────────────────────────────
  const markRead = useCallback(async (notificationId) => {
    try {
      await fetchWithAuth?.(`${baseEndpoint}/notifications/${notificationId}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (_) {}
  }, [fetchWithAuth, baseEndpoint]);

  // ── Mark all notifications as read ────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await fetchWithAuth?.(`${baseEndpoint}/notifications/read-all`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (_) {}
  }, [fetchWithAuth, baseEndpoint]);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fetchWithAuth) return;

    fetchNotifications();

    if (userId) startFirestoreListener(userId);

    const poll = setInterval(fetchNotifications, POLL_INTERVAL);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      const current = Notification.permission;
      setPermissionState(current);
      if (current === 'granted') requestPermission();
    }

    return () => {
      clearInterval(poll);
      unsubscribeFirestoreRef.current?.();
    };
  }, [fetchWithAuth, userId]); // eslint-disable-line react-hooks/exhaustive-deps

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
