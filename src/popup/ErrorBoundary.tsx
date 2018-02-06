import * as React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  errorMetadata: {
    info: string | undefined;
    error: undefined | { message: string; stack: string };
  };
}

class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  constructor(props) {
    super(props);

    this.state = {
      errorMetadata: {
        error: undefined,
        info: undefined,
      },
      hasError: false,
    };
  }

  public componentDidCatch(error, info) {
    this.setState({ hasError: true, errorMetadata: { error, info } });
  }

  public render() {
    if (this.state.hasError) {
      const formatError = (error: string) =>
        JSON.stringify(error).replace(/\\n/g, "\n");
      const error = this.state.errorMetadata.error || "No Error Message";
      const stackTrace =
        this.state.errorMetadata.error !== undefined
          ? this.state.errorMetadata.error.stack
          : "No Stack Trace!";
      const info = this.state.errorMetadata.info
        ? formatError(this.state.errorMetadata.info)
        : "Info unavailable";
      const version = "v" + chrome.runtime.getManifest().version;

      const issueTemplate = encodeURIComponent(
        `${version} Popup Error\nError:\n${error}\nInfo:\n${info}\nStack Trace:\n${formatError(
          stackTrace,
        )}`,
      );
      const githubIssuesUrl = `https://github.com/simmsa/dark-mode/issues/new?body=${issueTemplate}`;

      const link = (text, url) => {
        return (
          <a href={url} style={{ color: "white", outline: 0 }} target="_blank">
            {text}
          </a>
        );
      };

      return (
        <div style={{ color: "white", fontSize: "14px", padding: "12px" }}>
          <p>
            Could not load Dark Mode! If the issue persists please{" "}
            {link("report this error", githubIssuesUrl)}. See below for
            details...
          </p>
          <p>{`Error: ${error}`}</p>
          <p>{`Info: ${info}`}</p>
          <p>{`Stack Trace: ${stackTrace}`}</p>
        </div>
      );
    }

    return <div>{this.props.children}</div>;
  }
}

export default ErrorBoundary;
