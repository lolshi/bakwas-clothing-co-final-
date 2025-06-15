import React from 'react';
import { Check } from 'lucide-react';

interface StepProps {
  label: string;
  completed?: boolean;
  active?: boolean;
}

const Step: React.FC<StepProps> = ({ label, completed = false, active = false }) => {
  return (
    <div className="flex-1 flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center
        ${completed ? 'bg-cyan-400' : active ? 'bg-white/20' : 'bg-gray-700'}`}>
        {completed ? (
          <Check className="w-5 h-5 text-black" />
        ) : (
          <span className={`${active ? 'text-white' : 'text-gray-400'}`}>
            {label[0]}
          </span>
        )}
      </div>
      <span className={`mt-2 text-sm ${active ? 'text-white' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
};

export default Step; 