import { SnackbarProvider } from 'notistack';
import { BaseComponentProps } from 'types';

const NotificationProvider = ({ children }: BaseComponentProps) => {
    return <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>;
};

export default NotificationProvider;
