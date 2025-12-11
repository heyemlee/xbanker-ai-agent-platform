'use client';

import { useState } from 'react';
import { Brain, Search, Shield, FileText, CheckCircle2, AlertCircle, Loader2, ChevronRight, ChevronDown, Database, Wrench, Clock, AlertTriangle, XCircle, Play } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

interface AgentStep {
    agent_name: string;
    agent_role: string;
    input: any;
    output: any;
    execution_time: number;
    status: string;
    tools_used: string[];
    rag_details?: any;
    tool_calls?: any[];
}

export default function AgentsPage() {
    const [formData, setFormData] = useState({
        full_name: '',
        kyc_notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [workflowResult, setWorkflowResult] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setWorkflowResult(null);
        setCurrentStep(0);
        setShowModal(true);

        // Simulate agent steps
        const steps = [
            { name: 'KYC Analyst', action: 'Extracting entities...' },
            { name: 'Risk Assessor', action: 'Retrieving similar cases...' },
            { name: 'Compliance Officer', action: 'Checking databases...' },
            { name: 'Final Decision', action: 'Compiling report...' }
        ];

        for (let i = 0; i < steps.length; i++) {
            setCurrentStep(i + 1);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 从1500ms减到1000ms
        }

        try {
            const response = await fetch('http://localhost:8000/agents/orchestrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Orchestration failed');

            const data = await response.json();
            setWorkflowResult(data);

            // Animate through steps
            for (let i = 0; i <= data.workflow_execution.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 300)); // 从800ms减到300ms
                setCurrentStep(i);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const AgentNode = ({ step, index, isActive, isCompleted }: {
        step: AgentStep;
        index: number;
        isActive: boolean;
        isCompleted: boolean;
    }) => {
        const getIcon = () => {
            if (step.agent_name.includes('KYC')) return <Brain size={20} />;
            if (step.agent_name.includes('Risk')) return <Database size={20} />;
            if (step.agent_name.includes('Compliance')) return <Wrench size={20} />;
            return <Brain size={20} />;
        };

        return (
            <div className={cn(
                "relative p-6 rounded-xl border-2 transition-all duration-500",
                isActive && "border-brand bg-brand/5 shadow-lg scale-105",
                isCompleted && !isActive && "border-success-text/30 bg-success-bg",
                !isActive && !isCompleted && "border-slate-200 bg-white opacity-60"
            )}>
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-500",
                            isActive && "bg-gradient-to-br from-slate-700 to-slate-900 shadow-xl shadow-amber-600/30 scale-110 animate-pulse-glow",
                            isCompleted && !isActive && "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg",
                            !isActive && !isCompleted && "bg-slate-100"
                        )}>
                            {/* Background glow effect */}
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 animate-pulse" />
                            )}
                            {/* Logo */}
                            <img
                                src="/xBanker_logo.png"
                                alt="Agent"
                                className={cn(
                                    "w-8 h-8 object-contain relative z-10 transition-all duration-500",
                                    isActive && "brightness-0 invert",
                                    isCompleted && !isActive && "brightness-0 invert",
                                    !isActive && !isCompleted && "opacity-40"
                                )}
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{step.agent_name}</h3>
                            <p className="text-xs text-slate-500">{step.agent_role}</p>
                        </div>
                    </div>
                    {isCompleted && (
                        <CheckCircle2 className="text-success-text" size={20} />
                    )}
                    {isActive && !isCompleted && (
                        <div className="animate-spin">
                            <Clock className="text-amber-600" size={20} />
                        </div>
                    )}
                </div>

                {/* Tools & RAG */}
                {isCompleted && (
                    <div className="space-y-3">
                        {step.tools_used && step.tools_used.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Tools Used:</p>
                                <div className="flex flex-wrap gap-2">
                                    {step.tools_used.map((tool, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700">
                                            <Wrench size={12} />
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step.rag_details && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Database size={16} className="text-blue-700" />
                                    <p className="text-sm font-bold text-blue-900">🔍 RAG - Retrieved Historical Cases</p>
                                </div>

                                {step.rag_details.cases && step.rag_details.cases.length > 0 ? (
                                    <div className="space-y-3">
                                        {step.rag_details.cases.map((caseItem: any, idx: number) => (
                                            <div key={idx} className="bg-white rounded-lg border border-blue-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                                                {/* Case Header */}
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-mono font-semibold text-blue-700">{caseItem.case_id}</span>
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-full text-xs font-semibold",
                                                                caseItem.risk_level === 'Low' && "bg-green-100 text-green-700",
                                                                caseItem.risk_level === 'Medium' && "bg-yellow-100 text-yellow-700",
                                                                caseItem.risk_level === 'High' && "bg-red-100 text-red-700"
                                                            )}>
                                                                {caseItem.risk_level} Risk
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-medium text-slate-900">{caseItem.client_name}</p>
                                                        <p className="text-xs text-slate-500">{caseItem.client_type}</p>
                                                    </div>
                                                    <span className={cn(
                                                        "px-2 py-1 rounded text-xs font-semibold",
                                                        caseItem.outcome.includes('Approved')
                                                            ? "bg-success-bg text-success-text"
                                                            : "bg-warning-bg text-warning-text"
                                                    )}>
                                                        {caseItem.outcome}
                                                    </span>
                                                </div>

                                                {/* Case Summary */}
                                                <p className="text-xs text-slate-700 mb-2 leading-relaxed">{caseItem.summary}</p>

                                                {/* Jurisdictions */}
                                                {caseItem.jurisdictions && caseItem.jurisdictions.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {caseItem.jurisdictions.map((jurisdiction: string, jIdx: number) => (
                                                            <span key={jIdx} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                                                📍 {jurisdiction}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Relevance Score */}
                                                <div className="pt-2 border-t border-blue-100">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-medium text-slate-600">Similarity Match</span>
                                                        <span className="text-xs font-bold text-blue-700">{(caseItem.relevance * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
                                                            style={{ width: `${caseItem.relevance * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Summary Stats */}
                                        <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                                            <span className="text-xs text-blue-700">
                                                <strong>{step.rag_details.retrieved_cases}</strong> similar cases analyzed
                                            </span>
                                            <span className="text-xs text-blue-600">
                                                Avg relevance: <strong>{(step.rag_details.relevance_scores.reduce((a: number, b: number) => a + b, 0) / step.rag_details.relevance_scores.length * 100).toFixed(1)}%</strong>
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-blue-700 space-y-1">
                                        <p>• Retrieved {step.rag_details.retrieved_cases} similar cases</p>
                                        <p>• Relevance scores: {step.rag_details.relevance_scores.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {step.tool_calls && step.tool_calls.length > 0 && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Wrench size={16} className="text-purple-700" />
                                    <p className="text-sm font-bold text-purple-900">🔧 Tool Calls - External API Integration</p>
                                </div>

                                <div className="space-y-3">
                                    {step.tool_calls.map((call: any, idx: number) => (
                                        <div key={idx} className="bg-white rounded-lg border border-purple-200 p-3 shadow-sm">
                                            {/* Tool Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                                        call.tool === 'check_pep_database' ? "bg-blue-100" : "bg-purple-100"
                                                    )}>
                                                        <Wrench size={14} className={cn(
                                                            call.tool === 'check_pep_database' ? "text-blue-700" : "text-purple-700"
                                                        )} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{call.output.tool}</p>
                                                        <p className="text-xs text-slate-500">{call.output.tool_type || 'API Call'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "px-2 py-1 rounded-full text-xs font-semibold",
                                                        call.output.status === 'Clear'
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    )}>
                                                        ✓ {call.output.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Summary */}
                                            <p className="text-xs text-slate-700 mb-3 leading-relaxed">{call.output.summary || call.output.details}</p>

                                            {/* Databases Checked */}
                                            {call.output.databases_checked && Array.isArray(call.output.databases_checked) && call.output.databases_checked.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-xs font-semibold text-slate-600 mb-2">Databases Searched:</p>
                                                    <div className="space-y-1.5">
                                                        {call.output.databases_checked.map((db: any, dbIdx: number) => (
                                                            <div key={dbIdx} className="bg-slate-50 rounded px-2 py-1.5 text-xs">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <span className="font-medium text-slate-800">{db.name}</span>
                                                                        <span className="text-slate-500 mx-1">•</span>
                                                                        <span className="text-slate-600">{db.provider}</span>
                                                                    </div>
                                                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium ml-2">
                                                                        {db.result}
                                                                    </span>
                                                                </div>
                                                                {db.total_entries && (
                                                                    <p className="text-slate-500 mt-0.5">
                                                                        {db.total_entries.toLocaleString()} records searched
                                                                        {db.programs_checked && ` • ${db.programs_checked.length} programs`}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Search Parameters */}
                                            {call.output.search_parameters && (
                                                <div className="mb-3">
                                                    <p className="text-xs font-semibold text-slate-600 mb-1.5">Search Parameters:</p>
                                                    <div className="bg-slate-50 rounded px-2 py-1.5 text-xs text-slate-700 space-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500">Name:</span>
                                                            <span className="font-medium">{call.output.search_parameters.name}</span>
                                                        </div>
                                                        {call.output.search_parameters.fuzzy_match && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-slate-500">Fuzzy Match:</span>
                                                                <span className="font-medium">Enabled (threshold: {call.output.search_parameters.match_threshold}%)</span>
                                                            </div>
                                                        )}
                                                        {call.output.search_parameters.aliases_checked && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-slate-500">Coverage:</span>
                                                                <span className="font-medium">Aliases + Family Members</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Metrics */}
                                            <div className="flex items-center justify-between pt-2 border-t border-purple-100">
                                                <div className="flex items-center gap-4 text-xs">
                                                    {call.output.confidence_score && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-slate-500">Confidence:</span>
                                                            <span className="font-bold text-green-700">{(call.output.confidence_score * 100).toFixed(1)}%</span>
                                                        </div>
                                                    )}
                                                    {call.output.execution_time_ms && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={10} className="text-slate-400" />
                                                            <span className="text-slate-600">{call.output.execution_time_ms}ms</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {call.output.api_version && (
                                                    <span className="text-xs text-slate-400">API {call.output.api_version}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock size={12} />
                            <span>{step.execution_time.toFixed(2)}s</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="AI Agent Suite"
                description="Multi-agent orchestration with RAG, tool calling, and intelligent workflow automation for KYC and risk analysis."
            />

            <Card title="Multi-Agent Analysis">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8">
                            <Input
                                label="Client Name *"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                required
                                placeholder="e.g. Alexandra Thompson"
                            />
                        </div>
                        <div className="md:col-span-4 flex items-end">
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full font-medium py-2.5"
                            >
                                <Play className="mr-2 h-4 w-4" />
                                Run Workflow
                            </Button>
                        </div>
                    </div>

                    <Textarea
                        label="KYC Notes *"
                        value={formData.kyc_notes}
                        onChange={(e) => setFormData({ ...formData, kyc_notes: e.target.value })}
                        required
                        rows={6}
                        placeholder="Paste KYC documentation for multi-agent analysis..."
                        className="font-mono text-sm"
                    />
                </form>

                {/* Architecture Info */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Workflow Architecture</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <FileText size={16} />
                            </div>
                            <div>
                                <span className="block text-sm font-semibold text-slate-900">KYC Analyst</span>
                                <span className="text-xs text-slate-500">Extracts structured data</span>
                            </div>
                        </div>
                        <div className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                <Brain size={16} />
                            </div>
                            <div>
                                <span className="block text-sm font-semibold text-slate-900">Risk Assessor</span>
                                <span className="text-xs text-slate-500">RAG & Risk Scoring</span>
                            </div>
                        </div>
                        <div className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <Shield size={16} />
                            </div>
                            <div>
                                <span className="block text-sm font-semibold text-slate-900">Compliance</span>
                                <span className="text-xs text-slate-500">PEP & Sanctions Checks</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Agent Execution Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Agent Execution Flow"
                maxWidth="full"
            >
                <div className="max-w-5xl mx-auto space-y-8 pb-12">
                    {/* Progress Indicator */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center space-y-4">
                                <div className="relative w-24 h-24 mx-auto">
                                    {/* Outer ring */}
                                    <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                                    {/* Spinning ring with gradient - faster animation */}
                                    <div className="absolute inset-0 border-4 border-transparent border-t-slate-700 border-r-amber-600 rounded-full animate-spin" style={{ animationDuration: '0.6s' }}></div>
                                    {/* Inner glow */}
                                    <div className="absolute inset-2 bg-gradient-to-br from-slate-700/10 to-amber-600/10 rounded-full animate-pulse"></div>
                                    {/* Logo */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img
                                            src="/xBanker_logo.png"
                                            alt="Processing"
                                            className="w-12 h-12 object-contain animate-pulse"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900">AI Agents Working...</h3>
                                    <p className="text-slate-500">
                                        {currentStep === 1 && "KYC Analyst extracting entities..."}
                                        {currentStep === 2 && "Risk Assessor retrieving similar cases..."}
                                        {currentStep === 3 && "Compliance Officer checking databases..."}
                                        {currentStep === 4 && "Finalizing decision report..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {workflowResult && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Final Result Dashboard */}
                            {workflowResult.final_result && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                                    {/* Header Banner */}
                                    <div className={cn(
                                        "px-6 py-6 border-b flex items-center justify-between",
                                        workflowResult.final_result.compliance_decision.compliance_status === 'Approved' ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100" :
                                            workflowResult.final_result.compliance_decision.compliance_status === 'Review Required' ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100" :
                                                "bg-gradient-to-r from-red-50 to-rose-50 border-red-100"
                                    )}>
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white",
                                                workflowResult.final_result.compliance_decision.compliance_status === 'Approved' ? "bg-emerald-100 text-emerald-600" :
                                                    workflowResult.final_result.compliance_decision.compliance_status === 'Review Required' ? "bg-amber-100 text-amber-600" :
                                                        "bg-red-100 text-red-600"
                                            )}>
                                                {workflowResult.final_result.compliance_decision.compliance_status === 'Approved' ? <CheckCircle2 size={28} /> :
                                                    workflowResult.final_result.compliance_decision.compliance_status === 'Review Required' ? <AlertTriangle size={28} /> :
                                                        <XCircle size={28} />}
                                            </div>
                                            <div>
                                                <h3 className={cn(
                                                    "text-2xl font-bold",
                                                    workflowResult.final_result.compliance_decision.compliance_status === 'Approved' ? "text-emerald-900" :
                                                        workflowResult.final_result.compliance_decision.compliance_status === 'Review Required' ? "text-amber-900" :
                                                            "text-red-900"
                                                )}>
                                                    {workflowResult.final_result.compliance_decision.compliance_status}
                                                </h3>
                                                <p className="text-sm text-slate-600 font-medium mt-1">
                                                    {workflowResult.final_result.compliance_decision.approval_tier || "Level 1 (Automated)"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Confidence Score</p>
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-slate-800 rounded-full transition-all duration-1000"
                                                        style={{ width: `${(workflowResult.final_result.compliance_decision.confidence_score * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-3xl font-black text-slate-800">
                                                    {(workflowResult.final_result.compliance_decision.confidence_score * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dashboard Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                                        {/* Column 1: Risk Assessment */}
                                        <div className="p-6 space-y-6">
                                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                                <Shield size={16} className="text-slate-400" />
                                                Risk Assessment
                                            </h4>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-slate-600">Risk Score</span>
                                                    <span className="font-bold text-slate-900">{workflowResult.final_result.compliance_decision.risk_score}/100</span>
                                                </div>
                                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000",
                                                            workflowResult.final_result.compliance_decision.risk_score < 30 ? "bg-emerald-500" :
                                                                workflowResult.final_result.compliance_decision.risk_score < 70 ? "bg-amber-500" : "bg-red-500"
                                                        )}
                                                        style={{ width: `${workflowResult.final_result.compliance_decision.risk_score}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Based on RAG analysis of similar cases and KYC data.
                                                </p>
                                            </div>

                                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                                <p className="text-xs font-semibold text-slate-900">Decision Breakdown</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {Object.entries(workflowResult.final_result.compliance_decision.decision_breakdown || {}).map(([key, status]: [string, any]) => (
                                                        <div key={key} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                                                            <span className="text-xs text-slate-600 capitalize">{key.replace('_', ' ')}</span>
                                                            <span className={cn(
                                                                "text-xs font-bold px-1.5 py-0.5 rounded",
                                                                status === 'Pass' ? "bg-emerald-100 text-emerald-700" :
                                                                    status === 'Warning' ? "bg-amber-100 text-amber-700" :
                                                                        "bg-red-100 text-red-700"
                                                            )}>{status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Column 2: Rationale */}
                                        <div className="p-6 space-y-6">
                                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                                <Brain size={16} className="text-slate-400" />
                                                Decision Rationale
                                            </h4>
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed">
                                                {workflowResult.final_result.compliance_decision.rationale}
                                            </div>
                                        </div>

                                        {/* Column 3: Actions */}
                                        <div className="p-6 space-y-6">
                                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-slate-400" />
                                                Recommended Actions
                                            </h4>
                                            <ul className="space-y-3">
                                                {workflowResult.final_result.compliance_decision.recommended_actions?.map((action: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                                                            <ChevronRight size={14} />
                                                        </div>
                                                        {action}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Execution Steps */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900">Detailed Execution Log</h3>
                                {workflowResult.workflow_execution.map((step: AgentStep, index: number) => (
                                    <div key={index}>
                                        <AgentNode
                                            step={step}
                                            index={index}
                                            isActive={false}
                                            isCompleted={true}
                                        />
                                        {index < workflowResult.workflow_execution.length - 1 && (
                                            <div className="flex justify-center my-2">
                                                <div className="w-0.5 h-8 bg-slate-200"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div >
    );
}

