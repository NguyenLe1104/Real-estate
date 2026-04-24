import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi, type Notification } from '@/api/notification';
import { useAuthStore } from '@/stores/authStore';

// ---- Types ----
type FilterType = 'all' | 'unread' | 'appointment' | 'post';

// ---- Icon helpers ----
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

const getTypeLabel = (type: Notification['type']): string => {
  switch (type) {
    case 'APPOINTMENT_APPROVED': return 'Lịch hẹn';
    case 'APPOINTMENT_REJECTED': return 'Lịch hẹn';
    case 'POST_APPROVED':        return 'Bài đăng';
    case 'POST_REJECTED':        return 'Bài đăng';
    case 'VIP_EXPIRING':         return 'VIP';
    default:                      return 'Hệ thống';
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
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatFullDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ---- Skeleton loader ----
const NotifSkeleton: React.FC = () => (
  <div style={{
    display: 'flex',
    gap: '16px',
    padding: '20px 24px',
    borderBottom: '1px solid #f3f4f6',
    animation: 'pulse 1.5s ease-in-out infinite',
  }}>
    <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e5e7eb', flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ height: 14, width: '60%', background: '#e5e7eb', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 12, width: '90%', background: '#f3f4f6', borderRadius: 6, marginBottom: 6 }} />
      <div style={{ height: 12, width: '75%', background: '#f3f4f6', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 11, width: '25%', background: '#e5e7eb', borderRadius: 6 }} />
    </div>
  </div>
);

// ---- Empty state ----
const EmptyState: React.FC<{ filter: FilterType }> = ({ filter }) => {
  const msgs: Record<FilterType, { emoji: string; text: string }> = {
    all:         { emoji: '🔔', text: 'Bạn chưa có thông báo nào' },
    unread:      { emoji: '✨', text: 'Tất cả thông báo đã được đọc!' },
    appointment: { emoji: '📅', text: 'Chưa có thông báo lịch hẹn nào' },
    post:        { emoji: '📝', text: 'Chưa có thông báo bài đăng nào' },
  };
  const { emoji, text } = msgs[filter];
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      color: '#9ca3af',
    }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>{emoji}</div>
      <p style={{ fontSize: 16, fontWeight: 500, color: '#6b7280' }}>{text}</p>
    </div>
  );
};

// ============================================================
// Main Page
// ============================================================
const NotificationsPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [notifications, setNotifs]    = useState<Notification[]>([]);
  const [filter, setFilter]           = useState<FilterType>('all');
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalItems, setTotalItems]   = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // Fetch page
  const fetchPage = useCallback(async (p: number, replace: boolean) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await notificationApi.getAll(p, 20);
      const { data, totalPages, unreadCount: uc, totalItems: ti } = res.data;
      setNotifs(prev => replace ? data : [...prev, ...data]);
      setHasMore(p < totalPages);
      setPage(p);
      setUnreadCount(uc);
      setTotalItems(ti);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  // Infinite scroll observer
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPage(page + 1, false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, fetchPage]);

  // ---- Filter logic (client-side) ----
  const filtered = notifications.filter(n => {
    if (filter === 'unread')      return !n.isRead;
    if (filter === 'appointment') return n.refType === 'appointment';
    if (filter === 'post')        return n.refType === 'post';
    return true;
  });

  // ---- Actions ----
  const handleClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await notificationApi.markAsRead(notif.id).catch(() => null);
      setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    }
    // Chỉ navigate cho bài đăng, lịch hẹn chỉ đánh dấu đọc
    if (notif.refType === 'post') navigate('/my-posts');
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
    setTotalItems(c => Math.max(0, c - 1));
  };

  const handleDeleteAllRead = async () => {
    await notificationApi.deleteAllRead().catch(() => null);
    setNotifs(prev => prev.filter(n => !n.isRead));
    setTotalItems(prev => prev - notifications.filter(n => n.isRead).length);
  };

  const filterTabs: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all',         label: 'Tất cả',     count: totalItems },
    { key: 'unread',      label: 'Chưa đọc',   count: unreadCount > 0 ? unreadCount : undefined },
    { key: 'appointment', label: 'Lịch hẹn' },
    { key: 'post',        label: 'Bài đăng' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)',
      paddingBottom: 60,
    }}>
      {/* Page header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 780,
          margin: '0 auto',
          padding: '24px 20px 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.5px',
              }}>
                🔔 Thông báo
              </h1>
              {totalItems > 0 && (
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
                  {totalItems} thông báo
                  {unreadCount > 0 && ` • ${unreadCount} chưa đọc`}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    background: '#f0f4ff',
                    color: '#254b86',
                    border: '1px solid #c7d4f5',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#dbeafe')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f0f4ff')}
                >
                  ✓ Đọc tất cả
                </button>
              )}
              {notifications.some(n => n.isRead) && (
                <button
                  onClick={handleDeleteAllRead}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    background: '#fff5f5',
                    color: '#ef4444',
                    border: '1px solid #fca5a5',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff5f5')}
                >
                  🗑 Xóa đã đọc
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid transparent' }}>
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '9px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: filter === tab.key ? 700 : 500,
                  color: filter === tab.key ? '#254b86' : '#6b7280',
                  borderBottom: filter === tab.key ? '2px solid #254b86' : '2px solid transparent',
                  marginBottom: -2,
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: '8px 8px 0 0',
                }}
                onMouseEnter={e => {
                  if (filter !== tab.key) e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={e => {
                  if (filter !== tab.key) e.currentTarget.style.color = '#6b7280';
                }}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span style={{
                    background: filter === tab.key ? '#254b86' : '#e5e7eb',
                    color: filter === tab.key ? '#fff' : '#6b7280',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 7px',
                    minWidth: 22,
                    textAlign: 'center',
                  }}>
                    {tab.count > 99 ? '99+' : tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: '24px auto 0', padding: '0 20px' }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}>
          {/* Skeleton */}
          {loading && (
            <>
              <NotifSkeleton />
              <NotifSkeleton />
              <NotifSkeleton />
              <NotifSkeleton />
            </>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <EmptyState filter={filter} />
          )}

          {/* List */}
          {!loading && filtered.map((notif, idx) => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              title={formatFullDate(notif.createdAt)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '18px 24px',
                cursor: 'pointer',
                background: notif.isRead ? '#fff' : '#f0f4ff',
                borderBottom: idx < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
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
              {/* Unread sidebar accent */}
              {!notif.isRead && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: getNotifColor(notif.type),
                  borderRadius: '4px 0 0 4px',
                }} />
              )}

              {/* Icon circle */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: `${getNotifColor(notif.type)}18`,
                border: `2.5px solid ${getNotifColor(notif.type)}35`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                flexShrink: 0,
                boxShadow: `0 2px 8px ${getNotifColor(notif.type)}22`,
              }}>
                {getNotifIcon(notif.type)}
              </div>

              {/* Text content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Category badge */}
                <span style={{
                  display: 'inline-block',
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: getNotifColor(notif.type),
                  background: `${getNotifColor(notif.type)}15`,
                  padding: '2px 8px',
                  borderRadius: 99,
                  marginBottom: 5,
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}>
                  {getTypeLabel(notif.type)}
                </span>

                <p style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: notif.isRead ? 500 : 700,
                  color: '#111827',
                  lineHeight: 1.4,
                  marginBottom: 4,
                }}>
                  {notif.title}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: '#4b5563',
                  lineHeight: 1.6,
                }}>
                  {notif.message}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <span style={{
                    fontSize: 12,
                    color: getNotifColor(notif.type),
                    fontWeight: 600,
                  }}>
                    {formatRelativeTime(notif.createdAt)}
                  </span>

                  {notif.refType === 'post' && (
                    <>
                      <span style={{ color: '#d1d5db', fontSize: 12 }}>•</span>
                      <span style={{
                        fontSize: 12,
                        color: '#254b86',
                        fontWeight: 600,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}>
                        Xem bài đăng →
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right: unread dot + delete */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                flexShrink: 0,
                paddingTop: 2,
              }}>
                {!notif.isRead && (
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59,130,246,0.2)',
                  }} />
                )}
                <button
                  onClick={e => handleDelete(e, notif.id)}
                  title="Xóa thông báo"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '5px',
                    color: '#d1d5db',
                    borderRadius: 8,
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    fontSize: 16,
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
                  🗑
                </button>
              </div>
            </div>
          ))}

          {/* Load-more sentinel (infinite scroll) */}
          <div ref={loaderRef} style={{ height: 1 }} />

          {/* Loading more spinner */}
          {loadingMore && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
              <div style={{
                width: 28,
                height: 28,
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #254b86',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          )}

          {/* End of list */}
          {!loading && !hasMore && filtered.length > 0 && (
            <div style={{
              textAlign: 'center',
              padding: '18px',
              color: '#9ca3af',
              fontSize: 13,
              borderTop: '1px solid #f3f4f6',
            }}>
              ✓ Bạn đã xem hết thông báo
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;
