import type { BaseComponentProps } from 'types';
import { SnackbarProvider } from 'notistack';

const NotificationProvider = ({ children }: BaseComponentProps) => {
    return <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>;
};

export default NotificationProvider;
