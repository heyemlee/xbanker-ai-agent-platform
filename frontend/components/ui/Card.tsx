import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
    title?: string;
    action?: ReactNode;
    noPadding?: boolean;
    variant?: 'default' | 'glass' | 'gradient';
}

export default function Card({
    children,
    className,
    title,
    action,
    noPadding = false,
    variant = 'default',
    ...props
}: CardProps) {
    const baseClasses = "rounded-xl overflow-hidden transition-all duration-300";

    const variantClasses = {
        default: "bg-white/95 backdrop-blur-sm shadow-lg border border-slate-200/80 hover:shadow-2xl hover:scale-[1.02] hover:border-slate-300",
        glass: "glass-card hover:bg-white/95 hover:shadow-2xl hover:scale-[1.02]",
        gradient: "bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-sm shadow-xl border border-slate-200/60 hover:shadow-2xl hover:scale-[1.02] hover:from-white hover:to-slate-100/95"
    };

    return (
        <div
            className={cn(
                baseClasses,
                variantClasses[variant],
                "group relative",
                className
            )}
            {...props}
        >
            {/* Animated gradient overlay on hover - business colors */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-700/0 via-slate-600/0 to-amber-600/0 group-hover:from-slate-700/5 group-hover:via-slate-600/5 group-hover:to-amber-600/5 transition-all duration-500 pointer-events-none" />

            {title && (
                <div className="px-6 py-4 border-b border-slate-100/80 flex items-center justify-between relative z-10 bg-gradient-to-r from-transparent via-slate-50/30 to-transparent">
                    <h3 className="text-base font-semibold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
                        {title}
                    </h3>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={cn(noPadding ? "" : "p-6", "relative z-10")}>
                {children}
            </div>
        </div>
    );
}
