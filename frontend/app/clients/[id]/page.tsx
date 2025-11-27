'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Sparkles, ArrowLeft, Building2, Globe, Calendar, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { getRiskBadgeVariant } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api';
import { Client, ClientInsights } from '@/types';
import { cn } from '@/lib/utils';

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = Number(params.id);

    const [client, setClient] = useState<Client | null>(null);
    const [insights, setInsights] = useState<ClientInsights | null>(null);
    const [loadingClient, setLoadingClient] = useState(true);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (clientId) {
            loadClient();
        }
    }, [clientId]);

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
                <Button onClick={() => router.push('/kyc')}>Back to Clients</Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
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
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{client.full_name}</h1>
                        <div className="flex items-center gap-3 mt-2 text-slate-500 text-sm">
                            <span className="flex items-center gap-1"><Globe size={14} /> {client.nationality}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1"><Building2 size={14} /> {client.residency_country}</span>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                        <Badge variant="neutral">Clear</Badge>
                                    )}
                                </div>
                                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                    <span className="text-sm text-slate-600">Sanctions</span>
                                    {client.sanctions_flag ? (
                                        <Badge variant="danger">Match Found</Badge>
                                    ) : (
                                        <Badge variant="neutral">Clear</Badge>
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

                {/* Middle & Right: Insights & KYC Details */}
                <div className="lg:col-span-2 space-y-6">
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

                    {/* KYC Summary */}
                    <Card title="KYC Documentation">
                        <div className="prose prose-sm max-w-none text-slate-600">
                            <h4 className="text-sm font-medium text-slate-900 mb-2">Executive Summary</h4>
                            <p className="mb-4">{client.kyc_summary}</p>

                            <h4 className="text-sm font-medium text-slate-900 mb-2">Raw Notes</h4>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 font-mono text-xs text-slate-500 whitespace-pre-wrap">
                                {client.raw_kyc_notes}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
