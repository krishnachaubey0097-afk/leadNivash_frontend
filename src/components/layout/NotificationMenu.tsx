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
  const [activeFilter, setActiveFilter] = useState<'all' | 'inquiry' | 'match' | 'deal'>('all');
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
      navigate('/app/buyers?tab=inquiries');
    } else if (n.data?.buyerId) {
      navigate(`/app/buyers/${n.data.buyerId}`);
    } else if (n.data?.dealId || n.type === 'deal') {
      navigate('/app/track-record');
    } else if (n.type === 'match') {
      navigate('/app/buyers');
    }
  };

  const getIconConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'deal':
        return {
          icon: Trophy,
          bg: 'bg-brand-50 text-brand-600 border-brand-200/60',
        };
      case 'match':
        return {
          icon: Sparkles,
          bg: 'bg-brand-50 text-brand-600 border-brand-200/60',
        };
      case 'inquiry':
        return {
          icon: Inbox,
          bg: 'bg-brand-50 text-brand-600 border-brand-200/60',
        };
      default:
        return {
          icon: Info,
          bg: 'bg-brand-50 text-brand-600 border-brand-200/60',
        };
    }
  };

  const filteredNotifications =
    activeFilter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

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
          className="relative w-10 h-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-slate-100 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-600"
          aria-label="Notifications"
          title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        >
          <Bell className="w-5 h-5 stroke-[2]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-4.5 px-1 rounded-full bg-ink-black text-white text-[10px] font-bold flex items-center justify-center shadow-xs ring-2 ring-white">
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
          className="z-50 w-[calc(100vw-24px)] sm:w-[380px] lg:w-[380px] max-w-[400px] bg-surface lg:bg-white/85 lg:dark:bg-slate-900/85 lg:backdrop-blur-md border border-border p-0 rounded-2xl lg:rounded-[20px] shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200 text-left overflow-hidden"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-border flex items-center justify-between gap-2 bg-white/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-bold text-ink">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-ink-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={unreadCount === 0}
                onClick={handleMarkAllRead}
                className="text-xs text-brand-700 dark:text-brand-400 font-semibold hover:text-brand-800 flex items-center gap-1 cursor-pointer transition disabled:opacity-40 disabled:text-slate-400 disabled:cursor-not-allowed whitespace-nowrap"
                title={unreadCount === 0 ? 'No unread notifications' : 'Mark all as read'}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-muted hover:text-rose-600 dark:hover:text-rose-400 font-semibold flex items-center gap-1 cursor-pointer transition"
                  title="Clear all"
                  aria-label="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Explicit Close Button */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg text-muted hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
                title="Close"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Chips: All / Inquiries / Matches / Deals */}
          <div className="px-3.5 py-2 border-b border-border/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'inquiry', label: 'Inquiries' },
                { id: 'match', label: 'Matches' },
                { id: 'deal', label: 'Deals' },
              ] as const
            ).map((chip) => {
              const selected = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setActiveFilter(chip.id)}
                  className={clsx(
                    'px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border',
                    selected
                      ? 'bg-lime text-ink-900 border-lime font-bold'
                      : 'bg-white/80 dark:bg-slate-800/80 text-ink-700 dark:text-slate-300 border-border hover:bg-slate-100'
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Notification List with Safe Internal Scrolling (~480px max height) */}
          <div className="max-h-[min(480px,70vh)] overflow-y-auto divide-y divide-border overscroll-contain">
            {filteredNotifications.length === 0 ? (
              /* Empty State */
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-[14px] bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6 stroke-[1.8]" />
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
              filteredNotifications.map((n) => {
                const { icon: Icon, bg } = getIconConfig(n.type);

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={clsx(
                      'p-3.5 flex items-start justify-between gap-3 transition cursor-pointer hover:bg-slate-50/90 dark:hover:bg-slate-800/70',
                      !n.isRead ? 'bg-lime-soft/60 dark:bg-slate-800/80' : 'bg-white/70 dark:bg-slate-900/60'
                    )}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className={clsx('w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 border mt-0.5', bg)}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className={clsx('text-xs truncate', !n.isRead ? 'font-bold text-ink' : 'font-medium text-slate-700 dark:text-slate-300')}>
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
                        <span className="w-2 h-2 rounded-full bg-ink-black shrink-0" title="Unread" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, n.id)}
                        className="w-6 h-6 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition cursor-pointer"
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
