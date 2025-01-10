import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessIndicatorProps {
  show: boolean;
  fieldName: string;
}

export function SuccessIndicator({ show, fieldName }: SuccessIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2000); // Hide after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-green-500 animate-fade-in">
      <CheckCircle2 className="h-4 w-4" />
      {fieldName} requirements met!
    </div>
  );
}