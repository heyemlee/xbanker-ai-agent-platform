import Select from 'react-select';
import { cn } from '@/lib/utils';

const countries = [
    { value: 'United States', label: '🇺🇸 United States' },
    { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
    { value: 'Switzerland', label: '🇨🇭 Switzerland' },
    { value: 'Singapore', label: '🇸🇬 Singapore' },
    { value: 'Hong Kong, China', label: '🇨🇳 Hong Kong, China' },
    { value: 'Monaco', label: '🇲🇨 Monaco' },
    { value: 'Luxembourg', label: '🇱🇺 Luxembourg' },
    { value: 'Germany', label: '🇩🇪 Germany' },
    { value: 'France', label: '🇫🇷 France' },
    { value: 'China', label: '🇨🇳 China' },
    { value: 'Japan', label: '🇯🇵 Japan' },
    { value: 'Canada', label: '🇨🇦 Canada' },
    { value: 'Australia', label: '🇦🇺 Australia' },
    { value: 'Netherlands', label: '🇳🇱 Netherlands' },
    { value: 'Sweden', label: '🇸🇪 Sweden' },
];

interface CountrySelectProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
}

export default function CountrySelect({ label, value, onChange, placeholder, error }: CountrySelectProps) {
    const selectedOption = countries.find(c => c.value === value);

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {label}
                </label>
            )}
            <Select
                value={selectedOption}
                onChange={(option) => onChange(option?.value || '')}
                options={countries}
                placeholder={placeholder || 'Select country'}
                isClearable
                isSearchable
                className={cn("react-select-container", error && "border-danger-text")}
                classNamePrefix="react-select"
                styles={{
                    control: (base, state) => ({
                        ...base,
                        minHeight: '40px',
                        borderColor: error ? '#c01048' : state.isFocused ? '#635bff' : '#cbd5e1',
                        boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 91, 255, 0.2)' : 'none',
                        '&:hover': {
                            borderColor: '#94a3b8',
                        },
                    }),
                    option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#635bff' : state.isFocused ? '#f1f5f9' : 'white',
                        color: state.isSelected ? 'white' : '#1e293b',
                        cursor: 'pointer',
                    }),
                }}
            />
            {error && (
                <p className="mt-1 text-xs text-danger-text">{error}</p>
            )}
        </div>
    );
}
