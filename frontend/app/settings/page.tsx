'use client';

import { useState } from 'react';
import { Settings, Bell, Lock, Key, Save } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        alert('Settings saved successfully!');
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'api', label: 'API Keys', icon: Key },
    ];

    return (
        <div className="animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
            <div className="mb-6">
                <PageHeader
                    title="Settings"
                    description="Manage your application preferences and account settings."
                />
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <Card className="h-full" noPadding>
                        <nav className="p-2 space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                                            activeTab === tab.id
                                                ? "bg-brand/10 text-brand"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </Card>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0">
                    <Card className="h-full overflow-y-auto custom-scrollbar">
                        {activeTab === 'general' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-4">General Preferences</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Language" placeholder="English (US)" disabled />
                                            <Input label="Timezone" placeholder="UTC-08:00 (Pacific Time)" disabled />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <div>
                                                <p className="font-medium text-slate-900">Dark Mode</p>
                                                <p className="text-sm text-slate-500">Switch between light and dark themes</p>
                                            </div>
                                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                                                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-4">Notification Preferences</h3>
                                    <div className="space-y-3">
                                        {['Risk Alerts', 'KYC Updates', 'System Maintenance', 'Weekly Reports'].map((item) => (
                                            <div key={item} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                                <div>
                                                    <p className="font-medium text-slate-900">{item}</p>
                                                    <p className="text-sm text-slate-500">Receive notifications about {item.toLowerCase()}</p>
                                                </div>
                                                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-4">Security Settings</h3>
                                    <div className="space-y-4">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Lock className="mr-2 h-4 w-4" />
                                            Change Password
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Key className="mr-2 h-4 w-4" />
                                            Enable Two-Factor Authentication (2FA)
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'api' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-4">API Configuration</h3>
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                                        <p className="text-sm text-amber-800">
                                            These keys allow external applications to access your xBanker account. Keep them secret!
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <Input
                                            label="Production API Key"
                                            value="sk_live_xb_..."
                                            readOnly
                                            type="password"
                                        />
                                        <Button variant="secondary" size="sm">Regenerate Key</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                            <Button onClick={handleSave} isLoading={loading}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
