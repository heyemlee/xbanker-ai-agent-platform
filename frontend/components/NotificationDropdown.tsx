'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'alert' | 'success' | 'info';
    time: string;
    read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'High Risk Alert',
        message: 'Suspicious transaction pattern detected for Client #8821.',
        type: 'alert',
        time: '10 mins ago',
        read: false,
    },
    {
        id: '2',
        title: 'KYC Verification Complete',
        message: 'Alexandra Thompson has passed enhanced due diligence.',
        type: 'success',
        time: '1 hour ago',
        read: false,
    },
    {
        id: '3',
        title: 'System Maintenance',
        message: 'Scheduled maintenance tonight at 02:00 UTC.',
        type: 'info',
        time: '5 hours ago',
        read: true,
    },
];

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const deleteNotification = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return <AlertTriangle size={16} className="text-red-600" />;
            case 'success': return <CheckCircle2 size={16} className="text-emerald-600" />;
            default: return <Info size={16} className="text-blue-600" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'alert': return 'bg-red-50';
            case 'success': return 'bg-emerald-50';
            default: return 'bg-blue-50';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-danger-text rounded-full ring-2 ring-white" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Card className="shadow-xl border-slate-200" noPadding>
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
                            <h3 className="font-semibold text-slate-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs font-medium text-brand hover:text-brand-dark flex items-center gap-1"
                                >
                                    <Check size={12} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Bell className="mx-auto h-8 w-8 text-slate-200 mb-2" />
                                    <p className="text-sm">No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            className={cn(
                                                "p-4 hover:bg-slate-50 transition-colors cursor-pointer group relative",
                                                !notification.read && "bg-brand/5"
                                            )}
                                        >
                                            <div className="flex gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                                    getBgColor(notification.type)
                                                )}>
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className={cn(
                                                            "text-sm font-medium truncate pr-6",
                                                            notification.read ? "text-slate-700" : "text-slate-900"
                                                        )}>
                                                            {notification.title}
                                                        </p>
                                                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                            {notification.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => deleteNotification(e, notification.id)}
                                                className="absolute top-2 right-2 p-1 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl text-center">
                            <button className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                                View All Activity
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
