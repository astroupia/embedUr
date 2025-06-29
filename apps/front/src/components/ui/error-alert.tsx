import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ErrorAlertProps = {
  message: string;
  onDismiss: () => void;
  className?: string;
};

export function ErrorAlert({ message, onDismiss, className }: ErrorAlertProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-red-50 p-4',
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <X className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
