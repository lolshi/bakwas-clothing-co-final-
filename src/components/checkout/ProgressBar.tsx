
import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: 'cart' | 'checkout' | 'success';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const steps = [
    { id: 'cart', label: 'Cart', completed: currentStep === 'checkout' || currentStep === 'success' },
    { id: 'checkout', label: 'Checkout', completed: currentStep === 'success' },
    { id: 'success', label: 'Success', completed: false },
  ];

  const getStepIndex = (step: string) => steps.findIndex(s => s.id === step);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                step.completed
                  ? 'bg-neon-cyan border-neon-cyan text-black'
                  : index === currentIndex
                  ? 'border-neon-cyan text-neon-cyan bg-transparent'
                  : 'border-gray-600 text-gray-400 bg-transparent'
              }`}>
                {step.completed ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className={`mt-2 text-sm font-medium ${
                index <= currentIndex ? 'text-neon-cyan' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-colors ${
                index < currentIndex ? 'bg-neon-cyan' : 'bg-gray-600'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
