import { useState, useEffect } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  startDelay?: number;
  onComplete?: () => void;
}

export const useTypewriter = ({ 
  text, 
  speed = 100, 
  startDelay = 0,
  onComplete 
}: UseTypewriterOptions) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const start = () => setIsActive(true);
  const reset = () => {
    setDisplayText('');
    setIsComplete(false);
    setIsActive(false);
  };

  useEffect(() => {
    if (!isActive) return;

    const startTimer = setTimeout(() => {
      let index = 0;
      const timer = setInterval(() => {
        if (index <= text.length) {
          setDisplayText(text.slice(0, index));
          index++;
        } else {
          clearInterval(timer);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(timer);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [isActive, text, speed, startDelay, onComplete]);

  return {
    displayText,
    isComplete,
    start,
    reset,
    isActive
  };
}; 