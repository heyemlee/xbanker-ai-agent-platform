'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Briefcase, Clock, Users, Search, Plus } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CaseCard from '@/components/CaseCard';
import { apiClient } from '@/lib/api';
import { RiskAlertListItem, Case } from '@/types';
import { cn } from '@/lib/utils';

type TabType = 'alerts' | 'cases';

export default function CasesPage() {
    const [activeTab, setActiveTab] = useState<TabType>('alerts');
    const [openAlerts, setOpenAlerts] = useState<RiskAlertListItem[]>([]);
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [alertsData, casesData] = await Promise.all([
                apiClient.getOpenAlerts(),
                apiClient.getCases({ status: 'Open' }),
            ]);
            setOpenAlerts(alertsData);
            setCases(casesData);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityVariant = (severity: string): 'default' | 'success' | 'warning' | 'danger' => {
        const s = severity.toLowerCase();
        if (s === 'low') return 'success';
        if (s === 'medium') return 'warning';
        if (s === 'high' || s === 'critical') return 'danger';
        return 'default';
    };

    const getPriorityColor = (priority: string) => {
        const p = priority.toLowerCase();
        if (p === 'critical') return 'text-danger-text';
        if (p === 'high') return 'text-danger-text';
        if (p === 'medium') return 'text-warning-text';
        return 'text-slate-500';
    };

    const getSLAStatus = (alert: RiskAlertListItem) => {
        if (!alert.sla_due_date) return null;

        const now = new Date();
        const dueDate = new Date(alert.sla_due_date);
        const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursRemaining < 0) {
            return { label: 'Overdue', color: 'bg-danger-bg text-danger-text border-danger-text' };
        } else if (hoursRemaining < 24) {
            return { label: `${Math.floor(hoursRemaining)}h left`, color: 'bg-warning-bg text-warning-text border-warning-text' };
        } else {
            return { label: `${Math.floor(hoursRemaining / 24)}d left`, color: 'bg-slate-100 text-slate-600 border-slate-300' };
        }
    };

    const filteredAlerts = openAlerts.filter(alert =>
        alert.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCases = cases.filter(caseItem =>
        caseItem.case_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500">
            <PageHeader
                title="Cases / Alerts"
                description="Compliance team workspace for managing alerts and investigations."
            />

            {/* Tabs */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/60 mb-6">
                <div className="flex gap-2 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-all duration-300",
                            activeTab === 'alerts'
                                ? "border-slate-800 text-slate-900"
                                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} />
                            Open Alerts ({openAlerts.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('cases')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-all duration-300",
                            activeTab === 'cases'
                                ? "border-slate-800 text-slate-900"
                                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Briefcase size={16} />
                            Active Cases ({cases.length})
                        </div>
                    </button>
                </div>
            </div>

            {/* Open Alerts Tab */}
            {activeTab === 'alerts' && (
                <Card noPadding>
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search alerts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                            />
                        </div>
                    </div>

                    {/* Alerts Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Priority</th>
                                    <th className="px-6 py-3">Client</th>
                                    <th className="px-6 py-3">Severity</th>
                                    <th className="px-6 py-3">Summary</th>
                                    <th className="px-6 py-3">SLA Due</th>
                                    <th className="px-6 py-3">Assigned To</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                            Loading alerts...
                                        </td>
                                    </tr>
                                ) : filteredAlerts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                            No open alerts found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAlerts.map((alert) => {
                                        const slaStatus = getSLAStatus(alert);
                                        return (
                                            <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={cn("font-medium", getPriorityColor(alert.priority))}>
                                                        {alert.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    {alert.client_name || 'General'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={getSeverityVariant(alert.severity)}>
                                                        {alert.severity}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 max-w-md">
                                                    <p className="text-slate-700 line-clamp-2">{alert.summary}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {slaStatus && (
                                                        <span className={cn("px-2 py-1 rounded text-xs font-medium border", slaStatus.color)}>
                                                            {slaStatus.label}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {alert.assigned_to || 'Unassigned'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-brand hover:text-brand-dark font-medium text-sm">
                                                        Review
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Active Cases Tab */}
            {activeTab === 'cases' && (
                <div>
                    {/* Toolbar */}
                    <div className="mb-6 flex justify-between items-center">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search cases..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                            />
                        </div>
                    </div>

                    {/* Cases Grid */}
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading cases...</div>
                    ) : filteredCases.length === 0 ? (
                        <Card>
                            <div className="text-center py-12">
                                <Briefcase className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                                <p className="font-medium text-slate-900">No active cases found</p>
                                <p className="text-sm text-slate-500 mt-1">Cases will appear here when alerts are escalated</p>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCases.map((caseItem) => (
                                <CaseCard key={caseItem.id} caseItem={caseItem} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
