import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { openWhatsApp } from '../../lib/whatsapp';
import { env } from '../../lib/env';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled app error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleReportIssue = () => {
    const errorDetails = this.state.error?.message || 'Unknown error';
    const text = `Hello leadNivash Support, I encountered an issue on the app: "${errorDetails}".`;
    openWhatsApp(env.VITE_FOUNDER_WHATSAPP, text);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-surface border border-border p-6 sm:p-8 rounded-card shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-danger dark:bg-rose-950/60 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div>
              <h1 className="text-lg font-black text-ink font-heading">
                Something went wrong
              </h1>
              <p className="text-xs text-muted leading-relaxed mt-1">
                An unexpected error occurred. Please refresh the page to try again, or reach out to our support team if the issue persists.
              </p>
            </div>

            {/* Display error detail if available */}
            {this.state.error && (
              <div className="p-3 rounded-xl bg-bg border border-border/80 text-left text-xs font-mono text-danger overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button onClick={this.handleRetry} pill className="flex-1 text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                <span>Reload Page</span>
              </Button>
              <Button onClick={this.handleReportIssue} variant="secondary" pill className="flex-1 text-xs">
                <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                <span>Contact Support</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
