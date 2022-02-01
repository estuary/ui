import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
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
        if (this.state.hasError) {
            console.log('render failed', this.state);
            return (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    Sorry - there was an unexpected error in some UI code. We've
                    logged some details in the dev console if you want to take a
                    look.
                </Alert>
            );
        } else {
            console.log('Render going ahead');
            return this.props.children;
        }
    }
}

export default ErrorBoundary;
