import { Component } from "react";
import Button from "../common/Button";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6">
          <div className="card max-w-lg p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Application Error
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
              Something broke before we could finish loading DevDNA.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
              We&apos;ve stopped the crash from taking down the whole app. Refresh and
              try again, and if the issue persists check your environment variables
              and Supabase configuration.
            </p>
            <Button className="mt-6" onClick={this.handleReset}>
              Reload workspace
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
