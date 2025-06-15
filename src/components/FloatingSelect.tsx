import React from 'react';

interface FloatingSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
}

const FloatingSelect: React.FC<FloatingSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options,
  required = false,
  error 
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="peer block w-full bg-transparent border-b-2 border-gray-600 py-2 px-0 text-white focus:outline-none focus:border-cyan-400 transition-all appearance-none"
      >
        <option value="" className="bg-gray-800 text-white">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-800 text-white">
            {option.label}
          </option>
        ))}
      </select>
      <label
        className={`absolute left-0 text-gray-400 text-sm transition-all duration-200 ${
          value ? '-top-2 text-sm text-cyan-400' : 'top-2 text-base peer-focus:-top-2 peer-focus:text-sm peer-focus:text-cyan-400'
        }`}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default FloatingSelect; 