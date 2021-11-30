import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        console.log('render', this.state.hasError);
        if (this.state.hasError) {
            return (
                <h1>
                    Sorry - there was a massive error. Some details are in the
                    dev console if you want to take a look.
                </h1>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
