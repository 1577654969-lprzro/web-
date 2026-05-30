import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="crd p-12 m-8 text-center bg-negative/5 border-negative/20">
          <div className="w-16 h-16 rounded-full bg-negative/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">数据可视化引擎异常</h3>
          <p className="text-sm text-text-muted mb-8 max-w-md mx-auto">
            检测到当前数据结构与视图不兼容，系统已自动启动容错保护。
            {isDev ? "（开发模式：已捕获详细错误信息）" : "建议您重置数据源或联系技术支持。"}
          </p>
          
          {isDev && (
            <div className="mb-8 p-4 bg-black/40 rounded-xl text-left border border-white/5 overflow-auto max-h-[200px]">
              <p className="text-[10px] font-mono text-negative mb-2 uppercase font-bold tracking-widest">Error Stack:</p>
              <pre className="text-[10px] font-mono text-text-secondary leading-relaxed">
                {this.state.error?.stack}
              </pre>
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-accent text-white text-sm font-bold rounded-xl shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all"
            >
              重新同步
            </button>
            <button
              onClick={() => {
                // 这个逻辑可以关联到 store 的 resetData
                window.location.href = "/";
              }}
              className="px-6 py-2.5 bg-white/5 text-text-secondary text-sm font-medium rounded-xl border border-white/10 hover:bg-white/10 transition-all"
            >
              返回首页
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
