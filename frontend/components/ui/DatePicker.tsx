import { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    label?: string;
    selected?: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    error?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
    ({ label, selected, onChange, placeholder, error }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <ReactDatePicker
                        selected={selected}
                        onChange={onChange}
                        dateFormat="yyyy-MM-dd"
                        placeholderText={placeholder || 'Select date'}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm hover:border-slate-400 pl-10",
                            error && "border-danger-text focus:ring-danger-text"
                        )}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                    />
                    <Calendar
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        size={16}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-xs text-danger-text">{error}</p>
                )}
            </div>
        );
    }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
