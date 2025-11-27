import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, CheckCircle2, FileText, Search, ArrowRight, Shield, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge, { getRiskBadgeVariant } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export type AnalysisTemplate = 'KYC_ANALYSIS' | 'RISK_SURVEILLANCE';

interface AIAnalysisPanelProps {
    templateType: AnalysisTemplate;
    onAnalyze: (context: string) => Promise<void>;
    loading: boolean;
    result?: any; // Flexible result type based on template
    title?: string;
    description?: string;
    placeholder?: string;
}

export default function AIAnalysisPanel({
    templateType,
    onAnalyze,
    loading,
    result,
    title,
    description,
    placeholder
}: AIAnalysisPanelProps) {
    const [context, setContext] = useState('');

    const handleAnalyze = async () => {
        if (!context.trim()) return;
        await onAnalyze(context);
    };

    const renderKYCResult = (data: any) => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">Risk Assessment</h4>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-700 font-medium">Risk Score</span>
                        <Badge variant={getRiskBadgeVariant(data.risk_score)}>{data.risk_score}</Badge>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-700 font-medium">PEP Check</span>
                        <Badge variant={data.pep_flag ? 'warning' : 'success'}>
                            {data.pep_flag ? 'Detected' : 'Clear'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">Sanctions</span>
                        <Badge variant={data.sanctions_flag ? 'danger' : 'success'}>
                            {data.sanctions_flag ? 'Match Found' : 'Clear'}
                        </Badge>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">Due Diligence</h4>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-700 font-medium">Conclusion</span>
                        <span className="text-sm font-medium text-slate-900">{data.cdd_conclusion || 'Standard CDD'}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-700 font-medium">EDD Required</span>
                        <Badge variant={data.edd_required ? 'warning' : 'neutral'}>
                            {data.edd_required ? 'Yes' : 'No'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">Next Review</span>
                        <span className="text-sm text-slate-900">In {data.next_review_months || 12} months</span>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-brand" />
                    Executive Summary
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {data.kyc_summary}
                </p>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Shield size={16} className="text-brand" />
                    Risk Rationale
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {data.risk_rationale}
                </p>
            </div>
        </div>
    );

    const renderRiskResult = (data: any) => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                    data.severity === 'Critical' || data.severity === 'High' ? "bg-red-100 text-red-600" :
                        data.severity === 'Medium' ? "bg-amber-100 text-amber-600" :
                            "bg-green-100 text-green-600"
                )}>
                    <AlertTriangle size={24} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">Risk Severity Analysis</h4>
                        <Badge variant={
                            data.severity === 'Critical' ? 'danger' :
                                data.severity === 'High' ? 'danger' :
                                    data.severity === 'Medium' ? 'warning' : 'success'
                        }>
                            {data.severity}
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                        Priority Level: <span className="font-medium text-slate-700">{data.priority || data.severity}</span>
                    </p>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Analysis Summary</h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {data.summary}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Risk Indicators</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.risk_tags?.map((tag: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200 font-medium">
                                #{tag}
                            </span>
                        )) || <span className="text-sm text-slate-400">No specific tags</span>}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Identified Entities</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.entities?.map((entity: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100 font-medium flex items-center gap-1">
                                <User size={10} /> {entity}
                            </span>
                        )) || <span className="text-sm text-slate-400">No entities identified</span>}
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-brand" />
                    Recommended Next Steps
                </h4>
                <div className="bg-brand-subtle/30 p-4 rounded-lg border border-brand-subtle text-sm text-slate-800">
                    {data.next_steps}
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Input Section */}
            <div className="flex flex-col h-full">
                <Card className="flex-1 flex flex-col h-full" noPadding>
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-brand/10 text-brand rounded-lg flex items-center justify-center border border-brand/20">
                                {templateType === 'KYC_ANALYSIS' ? <FileText size={20} /> :
                                    templateType === 'RISK_SURVEILLANCE' ? <Shield size={20} /> :
                                        <Sparkles size={20} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{title || 'AI Analysis'}</h3>
                                <p className="text-sm text-slate-500">{description || 'Enter data for automated compliance analysis'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col min-h-[400px]">
                        <textarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder={placeholder || "Paste client data, transaction logs, or news articles here..."}
                            className="flex-1 w-full resize-none border border-slate-200 rounded-lg p-4 bg-white focus:ring-2 focus:ring-brand focus:border-brand text-slate-700 placeholder:text-slate-400 text-sm leading-relaxed transition-all"
                            spellCheck={false}
                        />
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-medium">
                            {context.length} characters
                        </span>
                        <Button
                            onClick={handleAnalyze}
                            disabled={loading || !context.trim()}
                            className="w-full sm:w-auto"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Run Analysis
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Output Section */}
            <div className="flex flex-col h-full">
                <Card className="flex-1 h-full overflow-hidden flex flex-col" noPadding>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Search size={16} />
                            Analysis Results
                        </h3>
                        {result && (
                            <Badge variant="success" className="animate-in fade-in zoom-in">
                                Analysis Complete
                            </Badge>
                        )}
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-center space-y-4"
                                >
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-brand-subtle rounded-full animate-pulse"></div>
                                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-slate-900">Analyzing Data</h4>
                                        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                                            Our AI engine is processing the information against compliance rules and risk patterns...
                                        </p>
                                    </div>
                                </motion.div>
                            ) : result ? (
                                templateType === 'KYC_ANALYSIS' ? renderKYCResult(result) : renderRiskResult(result)
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center text-slate-400"
                                >
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <ArrowRight size={24} className="text-slate-300" />
                                    </div>
                                    <p className="font-medium">Ready to Analyze</p>
                                    <p className="text-sm mt-1 max-w-xs">
                                        Enter data in the panel on the left and click "Run Analysis" to see results here.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>
            </div>
        </div>
    );
}
