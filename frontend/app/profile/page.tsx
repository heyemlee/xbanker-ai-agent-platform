'use client';

import { User, Mail, Shield, Clock, MapPin, Building } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
    return (
        <div className="animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
            <div className="mb-6">
                <PageHeader
                    title="My Profile"
                    description="View and manage your personal information and activity."
                />
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar pb-8">
                {/* Left Column: User Info */}
                <div className="lg:col-span-1 space-y-8">
                    <Card noPadding>
                        <div className="p-8 flex flex-col items-center text-center border-b border-slate-100 bg-slate-50/50">
                            <div className="w-24 h-24 rounded-full bg-brand-subtle flex items-center justify-center text-brand text-2xl font-bold mb-4 ring-4 ring-white shadow-sm">
                                JD
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">John Doe</h2>
                            <p className="text-slate-500 mb-4">Senior Compliance Officer</p>
                            <Badge variant="success" className="px-3 py-1">Active Status</Badge>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Mail size={16} className="text-slate-400" />
                                <span>john.doe@xbanker.ai</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Building size={16} className="text-slate-400" />
                                <span>Compliance Dept.</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <MapPin size={16} className="text-slate-400" />
                                <span>New York, USA</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Clock size={16} className="text-slate-400" />
                                <span>Joined Nov 2023</span>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                            <Button variant="outline" className="w-full">Edit Profile</Button>
                        </div>
                    </Card>

                    <Card title="Role & Permissions">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">Role Level</span>
                                <Badge variant="neutral">Admin</Badge>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Access Rights</p>
                                <div className="flex flex-wrap gap-2">
                                    {['KYC Analysis', 'Risk Surveillance', 'User Management', 'System Config', 'Audit Logs'].map((perm) => (
                                        <span key={perm} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">
                                            {perm}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Activity */}
                <div className="lg:col-span-2 space-y-8">
                    <Card title="Recent Activity">
                        <div className="space-y-6">
                            {[
                                { action: 'Completed KYC Review', target: 'Alexandra Thompson', time: '2 hours ago', icon: Shield },
                                { action: 'Updated Risk Policy', target: 'Global AML Standards v2.1', time: '5 hours ago', icon: FileText },
                                { action: 'Flagged Transaction', target: 'TXN-88291-US', time: 'Yesterday', icon: AlertTriangle },
                                { action: 'Generated Report', target: 'Monthly Compliance Summary', time: '2 days ago', icon: FileText },
                                { action: 'User Login', target: 'Web Portal', time: '3 days ago', icon: User },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                        <item.icon size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">{item.action}</p>
                                        <p className="text-xs text-slate-500">{item.target}</p>
                                    </div>
                                    <span className="text-xs text-slate-400">{item.time}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                            <button className="text-sm text-brand font-medium hover:text-brand-dark">View Full Audit Log</button>
                        </div>
                    </Card>

                    <Card title="Performance Metrics">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                                <p className="text-2xl font-bold text-emerald-700">142</p>
                                <p className="text-xs font-medium text-emerald-600 mt-1">Cases Reviewed</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
                                <p className="text-2xl font-bold text-blue-700">98%</p>
                                <p className="text-xs font-medium text-blue-600 mt-1">Accuracy Rate</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-center">
                                <p className="text-2xl font-bold text-purple-700">12m</p>
                                <p className="text-xs font-medium text-purple-600 mt-1">Avg. Response Time</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

import { FileText, AlertTriangle } from 'lucide-react';
