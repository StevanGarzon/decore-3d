import React, { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white z-50 p-6 text-center">
          <div className="bg-red-500/20 border border-red-500 rounded-2xl p-6 max-w-md">
            <h2 className="text-xl font-bold mb-2">Erro ao carregar o modelo</h2>
            <p className="text-sm opacity-80 mb-4">
              {this.state.error?.message || "Ocorreu um erro ao tentar baixar o arquivo 3D."}
            </p>
            <p className="text-xs opacity-60">
              Ismo pode ocorrer se o link expirou (tmpfiles.org dura 60 min), ou o seu navegador/adblock bloqueou a conexão proxy.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
