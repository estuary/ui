import { BaseComponentProps } from 'types';

import { SnackbarProvider } from 'notistack';

const NotificationProvider = ({ children }: BaseComponentProps) => {
    return <SnackbarProvider maxSnack={5}>{children}</SnackbarProvider>;
};

export default NotificationProvider;
