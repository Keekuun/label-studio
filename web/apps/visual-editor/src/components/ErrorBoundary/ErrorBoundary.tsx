import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, Result } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: "48px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Result
            status="error"
            title="出现错误"
            subTitle={this.state.error?.message || "应用程序遇到了一个错误"}
            extra={[
              <Button type="primary" key="reload" icon={<ReloadOutlined />} onClick={this.handleReset}>
                重新加载
              </Button>,
            ]}
          >
            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <div style={{ marginTop: "24px", textAlign: "left" }}>
                <details>
                  <summary style={{ cursor: "pointer", marginBottom: "8px" }}>错误详情（开发模式）</summary>
                  <pre style={{ background: "#f5f5f5", padding: "12px", borderRadius: "4px", overflow: "auto" }}>
                    {this.state.error?.stack}
                    {"\n\n"}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

