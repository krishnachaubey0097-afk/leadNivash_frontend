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
    const text = `Namaste LeadNivesh Team, I encountered an issue on the app: "${errorDetails}".`;
    openWhatsApp(env.VITE_FOUNDER_WHATSAPP, text);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-surface border border-border p-6 sm:p-8 rounded-card shadow-sm space-y-4">
            <AlertCircle className="w-10 h-10 text-danger mx-auto" />
            <h1 className="text-lg font-bold text-ink font-heading">
              Kuch gadbad hui (App Error)
            </h1>
            <p className="text-xs text-muted leading-relaxed">
              Kripya page reload karke dobara koshish karein. Agar dikkat bani rahe, to directly team ko report karein.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button onClick={this.handleRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-1.5" />
                <span>Reload Page</span>
              </Button>
              <Button onClick={this.handleReportIssue} variant="secondary" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-1.5 text-brand-600" />
                <span>Report Issue</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
