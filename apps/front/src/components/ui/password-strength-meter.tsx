"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong' | '';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState<PasswordStrength>('');
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!password) {
      setStrength('');
      setScore(0);
      return;
    }

    // Calculate password strength
    let newScore = 0;
    
    // Length check
    if (password.length >= 8) newScore += 1;
    if (password.length >= 12) newScore += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) newScore += 1; // Has uppercase
    if (/[0-9]/.test(password)) newScore += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) newScore += 1; // Has special char

    // Set strength based on score
    let newStrength: PasswordStrength = 'weak';
    if (newScore >= 4) newStrength = 'strong';
    else if (newScore >= 3) newStrength = 'good';
    else if (newScore >= 2) newStrength = 'fair';
    
    setScore(newScore);
    setStrength(newStrength);
  }, [password]);

  if (!password) return null;

  const getStrengthText = () => {
    switch (strength) {
      case 'weak':
        return 'Weak';
      case 'fair':
        return 'Fair';
      case 'good':
        return 'Good';
      case 'strong':
        return 'Strong';
      default:
        return '';
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'good':
        return 'bg-blue-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };

  const getStrengthWidth = () => {
    // Calculate width based on score (0-5 scale)
    return `${(score / 5) * 100}%`;
  };

  return (
    <div className={cn('mt-2', className)}>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Password strength:</span>
        <span className="font-medium">{getStrengthText()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={cn('h-1.5 rounded-full transition-all duration-300', getStrengthColor())}
          style={{ width: getStrengthWidth() }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {password.length > 0 && password.length < 8 ? (
          'Password should be at least 8 characters long'
        ) : (
          <span className="text-xs text-gray-500">
            {strength === 'strong' 
              ? 'Great! Your password is strong.' 
              : strength === 'good' 
                ? 'Good, but could be stronger with special characters or numbers' 
                : strength === 'fair' 
                  ? 'Consider adding more characters or complexity' 
                  : 'Use a mix of letters, numbers, and symbols'}
          </span>
        )}
      </div>
    </div>
  );
}
