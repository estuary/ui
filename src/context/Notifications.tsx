import { SnackbarProvider } from 'notistack';
import { BaseComponentProps } from 'types';

const NotificationProvider = ({ children }: BaseComponentProps) => {
    return <SnackbarProvider maxSnack={5}>{children}</SnackbarProvider>;
};

export default NotificationProvider;
