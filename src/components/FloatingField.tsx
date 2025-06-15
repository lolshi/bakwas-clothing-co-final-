import React from 'react';

interface FloatingFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
  required?: boolean;
  error?: string;
}

const FloatingField: React.FC<FloatingFieldProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  fullWidth = false,
  required = false,
  error 
}) => {
  return (
    <div className={`relative ${fullWidth ? 'col-span-full' : ''}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="peer block w-full bg-transparent border-b-2 border-gray-600 py-2 px-0 text-white focus:outline-none focus:border-cyan-400 transition-all placeholder-transparent"
        placeholder={label}
      />
      <label
        className="absolute left-0 -top-2 text-gray-400 text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-sm peer-focus:text-cyan-400 transition-all duration-200"
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

export default FloatingField; 