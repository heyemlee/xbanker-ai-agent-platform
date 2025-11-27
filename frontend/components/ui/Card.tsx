import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    action?: ReactNode;
    noPadding?: boolean;
}

export default function Card({ children, className, title, action, noPadding = false }: CardProps) {
    return (
        <div className={cn(
            "bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden transition-all duration-200 hover:shadow-float",
            className
        )}>
            {title && (
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={cn(noPadding ? "" : "p-6")}>
                {children}
            </div>
        </div>
    );
}
