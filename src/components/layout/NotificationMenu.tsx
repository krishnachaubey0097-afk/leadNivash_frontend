import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Bell,
  CheckCheck,
  Trash2,
  Inbox,
  Sparkles,
  Trophy,
  Info,
  X,
} from 'lucide-react';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  type NotificationItem,
} from '../../lib/api/notifications';
import clsx from 'clsx';

function formatRelativeTime(dateString: string): string {
  try {
    const now = Date.now();
    const past = new Date(dateString).getTime();
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export const NotificationMenu: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // In case user is offline or backend is warming up
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleSync = () => loadNotifications();
    window.addEventListener('leadnivash_data_changed', handleSync);
    window.addEventListener('focus', handleSync);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadNotifications();
      }
    }, 15000);

    return () => {
      window.removeEventListener('leadnivash_data_changed', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(interval);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn('Failed to delete notification:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to clear notifications:', err);
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.isRead) {
      handleMarkSingleRead(n.id);
    }
    setOpen(false);

    // Navigate to relevant entity if present
    if (n.data?.propertyId) {
      navigate(`/app/properties/${n.data.propertyId}`);
    } else if (n.data?.inquiryId || n.type === 'inquiry') {
      navigate('/app/inquiries');
    } else if (n.data?.buyerId) {
      navigate(`/app/buyers/${n.data.buyerId}`);
    } else if (n.data?.dealId || n.type === 'deal') {
      navigate('/app/track-record');
    } else if (n.type === 'match') {
      navigate('/app/buyers');
    }
  };

  // Restrained status colors as specified in Prompt 7:
  // Emerald for positive activity, amber for warnings/inquiries, red for urgent events
  const getIconConfig = (type: NotificationItem['type'], data?: Record<string, any>) => {
    if (data?.urgent || data?.priority === 'high') {
      return {
        icon: Bell,
        bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      };
    }

    switch (type) {
      case 'deal':
        return {
          icon: Trophy,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        };
      case 'match':
        return {
          icon: Sparkles,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        };
      case 'inquiry':
        return {
          icon: Inbox,
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
        };
      default:
        return {
          icon: Info,
          bg: 'bg-slate-100 text-slate-700 border-slate-200/80',
        };
    }
  };

  return (
    <DropdownMenu.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) loadNotifications();
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative w-10 h-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-slate-100 transition-colors duration-150 cursor-pointer focus:outline-none"
          aria-label="Notifications"
          title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        >
          <Bell className="w-5 h-5 stroke-[2]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-4.5 px-1 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          collisionPadding={12}
          align="end"
          className="z-50 w-[calc(100vw-24px)] sm:w-[380px] max-w-[380px] bg-white border border-border p-0 rounded-2xl shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200 text-left overflow-hidden"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-ink">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-brand-700 font-semibold hover:text-brand-800 flex items-center gap-1 cursor-pointer transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-muted hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer transition"
                  title="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}

              {/* Explicit Mobile/Desktop Close Button */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg text-muted hover:text-ink hover:bg-slate-200/70 flex items-center justify-center transition cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List with Safe Internal Scrolling */}
          <div className="max-h-[min(480px,70vh)] overflow-y-auto divide-y divide-slate-100 overscroll-contain">
            {notifications.length === 0 ? (
              /* Prompt 7 Empty State Specification */
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center mx-auto shadow-2xs">
                  <Bell className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-ink">
                    You're all caught up
                  </h4>
                  <p className="text-xs text-muted max-w-[260px] mx-auto leading-relaxed">
                    New inquiries, property matches and important updates will appear here.
                  </p>
                </div>
              </div>
            ) : (
              notifications.map((n) => {
                const { icon: Icon, bg } = getIconConfig(n.type, n.data);

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={clsx(
                      'p-3.5 flex items-start justify-between gap-3 transition cursor-pointer hover:bg-slate-50',
                      !n.isRead ? 'bg-emerald-50/30' : 'bg-white'
                    )}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5', bg)}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className={clsx('text-xs truncate', !n.isRead ? 'font-bold text-ink' : 'font-medium text-slate-700')}>
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-muted whitespace-nowrap shrink-0">
                            {formatRelativeTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-start mt-0.5">
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" title="Unread" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, n.id)}
                        className="w-6 h-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                        title="Delete notification"
                        aria-label="Delete"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
