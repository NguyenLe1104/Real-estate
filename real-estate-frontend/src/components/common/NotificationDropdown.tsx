import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi, type Notification } from '@/api/notification';
import { useAuthStore } from '@/stores/authStore';

// ---- Icons ----
const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckAllIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
    <polyline points="20 6 9 17 4 12" />
    <line x1="4" y1="12" x2="20" y2="6" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

// ---- Helpers ----
const getNotifIcon = (type: Notification['type']) => {
  switch (type) {
    case 'APPOINTMENT_APPROVED': return '✅';
    case 'APPOINTMENT_REJECTED': return '❌';
    case 'POST_APPROVED':        return '📋';
    case 'POST_REJECTED':        return '⚠️';
    case 'VIP_EXPIRING':         return '👑';
    default:                      return '🔔';
  }
};

const getNotifColor = (type: Notification['type']): string => {
  switch (type) {
    case 'APPOINTMENT_APPROVED': return '#22c55e';
    case 'APPOINTMENT_REJECTED': return '#ef4444';
    case 'POST_APPROVED':        return '#3b82f6';
    case 'POST_REJECTED':        return '#f97316';
    case 'VIP_EXPIRING':         return '#eab308';
    default:                      return '#6366f1';
  }
};

const formatRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  const days    = Math.floor(diff / 86_400_000);
  if (minutes < 1)  return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours   < 24) return `${hours} giờ trước`;
  if (days    < 7)  return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

// ============================================================
// Component
// ============================================================
const NotificationDropdown: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [open, setOpen]               = useState(false);
  const [notifications, setNotifs]    = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading]         = useState(false);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollTimer   = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- Fetch unread count (polling every 30s) ----
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationApi.getUnreadCount();
      setUnreadCount(res.data.unreadCount);
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();
    pollTimer.current = setInterval(fetchUnreadCount, 30_000);
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, [fetchUnreadCount]);

  // ---- Fetch notifications ----
  const fetchNotifications = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    try {
      const res = await notificationApi.getAll(p, 15);
      const { data, totalPages, unreadCount: uc } = res.data;
      setNotifs(prev => append ? [...prev, ...data] : data);
      setHasMore(p < totalPages);
      setPage(p);
      setUnreadCount(uc);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // ---- Open / Close ----
  const handleOpen = () => {
    if (!open) {
      setOpen(true);
      fetchNotifications(1, false);
    } else {
      setOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ---- Actions ----
  const handleMarkRead = async (notif: Notification) => {
    if (!notif.isRead) {
      await notificationApi.markAsRead(notif.id).catch(() => null);
      setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    }
    // Chỉ navigate cho bài đăng, lịch hẹn chỉ đánh dấu đọc
    if (notif.refType === 'post') { navigate('/my-posts'); setOpen(false); }
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead().catch(() => null);
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await notificationApi.delete(id).catch(() => null);
    setNotifs(prev => {
      const removed = prev.find(n => n.id === id);
      if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
      return prev.filter(n => n.id !== id);
    });
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) fetchNotifications(page + 1, true);
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        aria-label="Thông báo"
        onClick={handleOpen}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          color: open ? '#002f5e' : '#6b7280',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#002f5e')}
        onMouseLeave={e => (e.currentTarget.style.color = open ? '#002f5e' : '#6b7280')}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            minWidth: '18px',
            height: '18px',
            background: '#ef4444',
            color: '#fff',
            borderRadius: '9999px',
            border: '2px solid #fff',
            fontSize: '10px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            transform: 'translate(33%, -33%)',
            lineHeight: 1,
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          id="notification-dropdown-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: '-120px',
            width: '380px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            zIndex: 9999,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            animation: 'notifDropIn 0.2s ease',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px 12px',
            borderBottom: '1px solid #f3f4f6',
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                Thông báo
              </h3>
              {unreadCount > 0 && (
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', display: 'block' }}>
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                title="Đánh dấu tất cả đã đọc"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#f0f4ff',
                  color: '#254b86',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#dbeafe')}
                onMouseLeave={e => (e.currentTarget.style.background = '#f0f4ff')}
              >
                <CheckAllIcon />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{
            maxHeight: '420px',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db transparent',
          }}>
            {notifications.length === 0 && !loading && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                color: '#9ca3af',
              }}>
                <BellIcon className="" />
                <p style={{ marginTop: '12px', fontSize: '14px', textAlign: 'center' }}>
                  Bạn chưa có thông báo nào
                </p>
              </div>
            )}

            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background: notif.isRead ? '#fff' : '#f0f4ff',
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = notif.isRead ? '#f9fafb' : '#e8eeff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = notif.isRead ? '#fff' : '#f0f4ff';
                }}
              >
                {/* Icon circle */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: `${getNotifColor(notif.type)}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0,
                  border: `2px solid ${getNotifColor(notif.type)}30`,
                }}>
                  {getNotifIcon(notif.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '13.5px',
                    fontWeight: notif.isRead ? 400 : 600,
                    color: '#111827',
                    lineHeight: '1.4',
                    marginBottom: '2px',
                  }}>
                    {notif.title}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '12.5px',
                    color: '#6b7280',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {notif.message}
                  </p>
                  <span style={{
                    fontSize: '11.5px',
                    color: getNotifColor(notif.type),
                    fontWeight: 600,
                    marginTop: '4px',
                    display: 'block',
                  }}>
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>

                {/* Unread dot + delete */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  {!notif.isRead && (
                    <div style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      marginTop: '3px',
                    }} />
                  )}
                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    title="Xóa"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '3px',
                      color: '#d1d5db',
                      borderRadius: '4px',
                      transition: 'color 0.15s, background 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = '#fee2e2';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#d1d5db';
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}

            {/* Load more */}
            {hasMore && !loading && (
              <div style={{ padding: '10px', textAlign: 'center' }}>
                <button
                  onClick={handleLoadMore}
                  style={{
                    background: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '6px 20px',
                    fontSize: '13px',
                    color: '#374151',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  Xem thêm
                </button>
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #254b86',
                  borderRadius: '50%',
                  animation: 'notifSpin 0.8s linear infinite',
                }} />
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid #f3f4f6',
              textAlign: 'center',
            }}>
              <button
                onClick={() => { navigate('/notifications'); setOpen(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#254b86',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Xem tất cả thông báo →
              </button>
            </div>
          )}
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes notifDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes notifSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
