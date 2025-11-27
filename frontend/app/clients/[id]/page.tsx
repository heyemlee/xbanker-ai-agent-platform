'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Sparkles, ArrowLeft, Building2, Globe, Calendar, Briefcase, FileText, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { getRiskBadgeVariant } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api';
import { Client, ClientInsights, KYCRecord, RiskAlert, Case } from '@/types';
import { cn } from '@/lib/utils';

type TabType = 'profile' | 'alerts' | 'activity';

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = Number(params.id);

    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [client, setClient] = useState<Client | null>(null);
    const [insights, setInsights] = useState<ClientInsights | null>(null);
    const [kycHistory, setKycHistory] = useState<KYCRecord[]>([]);
    const [alerts, setAlerts] = useState<RiskAlert[]>([]);
    const [cases, setCases] = useState<Case[]>([]);

    const [loadingClient, setLoadingClient] = useState(true);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingAlerts, setLoadingAlerts] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (clientId) {
            loadClient();
        }
    }, [clientId]);

    useEffect(() => {
        if (activeTab === 'profile' && kycHistory.length === 0) {
            loadKYCHistory();
        } else if (activeTab === 'alerts' && alerts.length === 0) {
            loadAlertsAndCases();
        }
    }, [activeTab]);

    const loadClient = async () => {
        try {
            setLoadingClient(true);
            const data = await apiClient.getClient(clientId);
            setClient(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load client');
        } finally {
            setLoadingClient(false);
        }
    };

    const loadInsights = async () => {
        try {
            setLoadingInsights(true);
            const data = await apiClient.getClientInsights(clientId);
            setInsights(data);
        } catch (err) {
            console.error('Failed to load insights:', err);
        } finally {
            setLoadingInsights(false);
        }
    };

    const loadKYCHistory = async () => {
        try {
            setLoadingHistory(true);
            const data = await apiClient.getClientKYCHistory(clientId);
            setKycHistory(data);
        } catch (err) {
            console.error('Failed to load KYC history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const loadAlertsAndCases = async () => {
        try {
            setLoadingAlerts(true);
            const [alertsData, casesData] = await Promise.all([
                apiClient.getClientAlerts(clientId),
                apiClient.getClientCases(clientId),
            ]);
            setAlerts(alertsData);
            setCases(casesData);
        } catch (err) {
            console.error('Failed to load alerts and cases:', err);
        } finally {
            setLoadingAlerts(false);
        }
    };

    const getStatusBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' => {
        if (status === 'Active') return 'success';
        if (status === 'Under Review') return 'warning';
        return 'default';
    };

    if (loadingClient) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading client profile...</p>
                </div>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Client Not Found</h1>
                <p className="text-slate-600 mb-6">{error || 'The requested client could not be found.'}</p>
                <Button onClick={() => router.push('/clients')}>Back to Clients</Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-slate-500 hover:text-slate-900 flex items-center gap-2 text-sm font-medium transition-colors mb-4"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{client.full_name}</h1>
                            <Badge variant={getStatusBadgeVariant(client.status)}>
                                {client.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-sm">
                            <span className="flex items-center gap-1"><Globe size={14} /> {client.nationality}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1"><Building2 size={14} /> {client.residency_country}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1">
                                <Badge variant={getRiskBadgeVariant(client.risk_score)} className="text-xs">
                                    {client.risk_score} Risk
                                </Badge>
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.push('/risk')}>
                            <Shield className="mr-2 h-4 w-4" />
                            Monitor Risk
                        </Button>
                        <Button onClick={loadInsights} disabled={loadingInsights}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            {insights ? 'Refresh Insights' : 'Generate Insights'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'profile'
                            ? "border-brand text-brand"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                >
                    Profile & KYC
                </button>
                <button
                    onClick={() => setActiveTab('alerts')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'alerts'
                            ? "border-brand text-brand"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                >
                    Alerts & Cases
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'activity'
                            ? "border-brand text-brand"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                >
                    Activity
                </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Left Column: Profile & Risk */}
                        <div className="space-y-6">
                            <Card title="Client Profile">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Client ID</p>
                                            <p className="text-sm font-medium text-slate-900">#{client.id.toString().padStart(6, '0')}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Date of Birth</p>
                                            <div className="flex items-center gap-2 text-sm text-slate-900">
                                                <Calendar size={14} className="text-slate-400" />
                                                {client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Source of Wealth</p>
                                            <div className="flex items-center gap-2 text-sm text-slate-900">
                                                <Briefcase size={14} className="text-slate-400" />
                                                {client.source_of_wealth || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Business Activity</p>
                                            <p className="text-sm text-slate-900">{client.business_activity || 'N/A'}</p>
                                        </div>
                                        {client.next_review_date && (
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Next KYC Review</p>
                                                <p className="text-sm text-slate-900">
                                                    {new Date(client.next_review_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <Card title="Risk Profile">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-700">Overall Risk Score</span>
                                        <Badge variant={getRiskBadgeVariant(client.risk_score)} className="px-3 py-1 text-sm">
                                            {client.risk_score}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                            <span className="text-sm text-slate-600">PEP Status</span>
                                            {client.pep_flag ? (
                                                <Badge variant="warning">Detected</Badge>
                                            ) : (
                                                <Badge variant="default">Clear</Badge>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                            <span className="text-sm text-slate-600">Sanctions</span>
                                            {client.sanctions_flag ? (
                                                <Badge variant="danger">Match Found</Badge>
                                            ) : (
                                                <Badge variant="default">Clear</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Risk Rationale</h4>
                                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            {client.risk_rationale || 'No rationale provided.'}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Middle & Right: KYC History + Insights */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* KYC History */}
                            <Card title="KYC History" noPadding>
                                {loadingHistory ? (
                                    <div className="p-6 text-center text-slate-500">Loading history...</div>
                                ) : kycHistory.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">No KYC history available.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-3">Version</th>
                                                    <th className="px-6 py-3">Risk Score</th>
                                                    <th className="px-6 py-3">CDD Conclusion</th>
                                                    <th className="px-6 py-3">Review Date</th>
                                                    <th className="px-6 py-3">Next Review</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {kycHistory.map((record) => (
                                                    <tr key={record.id} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4 font-medium">v{record.version}</td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant={getRiskBadgeVariant(record.risk_score)}>
                                                                {record.risk_score}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-700">{record.cdd_conclusion || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-slate-500">
                                                            {record.review_date ? new Date(record.review_date).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500">
                                                            {record.next_review_date ? new Date(record.next_review_date).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>

                            {/* Client 360 Insights */}
                            <Card className="min-h-[300px] relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-6">
                                    <Sparkles className="text-brand" size={20} />
                                    <h3 className="text-lg font-bold text-slate-900">Client 360 AI Insights</h3>
                                </div>

                                <AnimatePresence mode="wait">
                                    {!insights && !loadingInsights ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center py-12"
                                        >
                                            <div className="w-16 h-16 bg-brand-subtle rounded-full flex items-center justify-center mx-auto mb-4 text-brand">
                                                <Sparkles size={32} />
                                            </div>
                                            <h3 className="text-slate-900 font-medium mb-2">Generate AI Insights</h3>
                                            <p className="text-slate-500 max-w-md mx-auto mb-6">
                                                Use our AI engine to analyze client data, risk factors, and activity to generate actionable relationship insights.
                                            </p>
                                            <Button onClick={loadInsights}>Generate Analysis</Button>
                                        </motion.div>
                                    ) : loadingInsights ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col items-center justify-center py-12"
                                        >
                                            <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin mb-4"></div>
                                            <p className="text-slate-600 font-medium">Analyzing client profile...</p>
                                            <p className="text-slate-400 text-sm mt-1">Aggregating risk factors and history</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                        >
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-brand mb-3 flex items-center gap-2">
                                                        <User size={16} /> Profile Overview
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {insights?.insights.profile_overview.map((item, i) => (
                                                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-brand mb-3 flex items-center gap-2">
                                                        <Shield size={16} /> Risk & Compliance
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {insights?.insights.risk_compliance_view.map((item, i) => (
                                                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Suggested Actions</h4>
                                                    <ul className="space-y-3">
                                                        {insights?.insights.suggested_rm_actions.map((item, i) => (
                                                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                                <span className="w-5 h-5 bg-white rounded border border-slate-200 flex items-center justify-center text-xs font-medium text-slate-400 flex-shrink-0">
                                                                    {i + 1}
                                                                </span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-success-text mb-3">Next Best Actions</h4>
                                                    <ul className="space-y-2">
                                                        {insights?.insights.next_best_actions.map((item, i) => (
                                                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                                <CheckCircle2 size={16} className="text-success-text mt-0.5 flex-shrink-0" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'alerts' && (
                    <motion.div
                        key="alerts"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        {/* Alerts Section */}
                        <Card title="Risk Alerts" noPadding>
                            {loadingAlerts ? (
                                <div className="p-6 text-center text-slate-500">Loading alerts...</div>
                            ) : alerts.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">No alerts for this client.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {alerts.map((alert) => (
                                        <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    <AlertTriangle className="text-warning-text" size={20} />
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant={alert.severity === 'High' ? 'danger' : alert.severity === 'Medium' ? 'warning' : 'success'}>
                                                                {alert.severity}
                                                            </Badge>
                                                            <Badge variant="default">{alert.status}</Badge>
                                                        </div>
                                                        <p className="text-xs text-slate-500">
                                                            {new Date(alert.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-700 mb-3">{alert.summary}</p>
                                            {alert.risk_tags && alert.risk_tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {alert.risk_tags.map((tag, i) => (
                                                        <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {/* Cases Section */}
                        <Card title="Investigation Cases" noPadding>
                            {loadingAlerts ? (
                                <div className="p-6 text-center text-slate-500">Loading cases...</div>
                            ) : cases.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">No cases for this client.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {cases.map((caseItem) => (
                                        <div key={caseItem.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-medium text-slate-900">Case #{caseItem.id.toString().padStart(6, '0')}</h4>
                                                    <p className="text-sm text-slate-500">{caseItem.case_type}</p>
                                                </div>
                                                <Badge variant={caseItem.status === 'Closed' ? 'success' : 'warning'}>
                                                    {caseItem.status}
                                                </Badge>
                                            </div>
                                            {caseItem.investigation_notes && (
                                                <p className="text-sm text-slate-600 mb-2">{caseItem.investigation_notes}</p>
                                            )}
                                            <p className="text-xs text-slate-400">
                                                Created {new Date(caseItem.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'activity' && (
                    <motion.div
                        key="activity"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card>
                            <div className="text-center py-12">
                                <Activity className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                                <h3 className="text-slate-900 font-medium mb-2">Activity Tracking Coming Soon</h3>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    Transaction monitoring and behavioral analytics will be available once the transaction system is integrated.
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
