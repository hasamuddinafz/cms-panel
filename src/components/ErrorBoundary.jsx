import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import i18n from "../i18n/index";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { fallback } = this.props;
    if (fallback) return fallback;

    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle size={28} className="text-destructive" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground mb-1">{i18n.t("common.errorTitle")}</h2>
          <p className="text-sm text-muted-foreground max-w-sm">{i18n.t("common.errorDesc")}</p>
          {this.state.error?.message && (
            <p className="text-xs text-muted-foreground/60 mt-2 font-mono bg-muted px-3 py-1.5 rounded-md inline-block">
              {this.state.error.message}
            </p>
          )}
        </div>
        <button
          onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          className="flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw size={14} /> {i18n.t("common.refresh")}
        </button>
      </div>
    );
  }
}
