import React from 'react';
import { Briefcase, Clock, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Case } from '@/types';

interface CaseCardProps {
    caseItem: Case;
    onClick?: () => void;
}

export default function CaseCard({ caseItem, onClick }: CaseCardProps) {
    const getPriorityVariant = (priority: string): 'default' | 'success' | 'warning' | 'danger' => {
        const p = priority.toLowerCase();
        if (p === 'low') return 'success';
        if (p === 'medium') return 'warning';
        if (p === 'high' || p === 'critical') return 'danger';
        return 'default';
    };

    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-slate-900">Case #{caseItem.id.toString().padStart(6, '0')}</h3>
                    <p className="text-sm text-slate-500 mt-1">{caseItem.case_type}</p>
                </div>
                <Badge variant={getPriorityVariant(caseItem.priority)}>
                    {caseItem.priority}
                </Badge>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <Users size={14} className="text-slate-400" />
                    <span className="text-slate-700">{caseItem.client_name || 'Not assigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-slate-500">
                        Created {new Date(caseItem.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {caseItem.investigation_notes && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                    {caseItem.investigation_notes}
                </p>
            )}

            {caseItem.sar_status && (
                <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">SAR Status</p>
                    <Badge variant={caseItem.sar_status === 'Filed' ? 'success' : 'neutral'}>
                        {caseItem.sar_status}
                    </Badge>
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-brand hover:text-brand-dark font-medium text-sm">
                    View Details →
                </span>
            </div>
        </Card>
    );
}
