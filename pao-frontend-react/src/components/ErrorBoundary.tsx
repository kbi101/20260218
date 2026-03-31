import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', margin: '2rem', border: '1px solid red', backgroundColor: '#fff5f5', borderRadius: '10px' }}>
          <h1 style={{ color: 'red' }}>Something went wrong.</h1>
          <pre style={{ whiteSpace: 'pre-wrap', padding: '1rem', backgroundColor: '#eee' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', background: 'red', color: 'white', borderRadius: '5px' }}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
