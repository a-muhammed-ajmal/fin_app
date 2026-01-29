import React, { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 m-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-rose-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-rose-800 mb-1">Something went wrong</h3>
                <p className="text-rose-700 text-sm mb-2">{this.state.error?.message}</p>
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                  className="text-sm bg-rose-600 text-white px-3 py-1 rounded hover:bg-rose-700"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
