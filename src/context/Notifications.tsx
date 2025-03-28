import { SnackbarProvider } from 'notistack';

import type { BaseComponentProps } from 'src/types';

const NotificationProvider = ({ children }: BaseComponentProps) => {
    return <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>;
};

export default NotificationProvider;
