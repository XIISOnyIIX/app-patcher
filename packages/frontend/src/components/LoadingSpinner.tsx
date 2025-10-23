interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <span className={`loading loading-spinner ${sizeClasses[size]}`}></span>
      {message && <p className="text-sm opacity-70">{message}</p>}
    </div>
  );
}
