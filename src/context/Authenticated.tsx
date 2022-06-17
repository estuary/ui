import ConfirmationModalContextProvider from 'context/Confirmation';
import { PreFetchDataProvider } from 'context/PreFetchData';
import { ZustandProvider } from 'context/Zustand';
import { BaseComponentProps } from 'types';

// This is for contexts that should only be added to the app after the user has authenticated
function AuthenticatedOnlyContext({ children }: BaseComponentProps) {
    return (
        <ConfirmationModalContextProvider>
            <PreFetchDataProvider>
                <ZustandProvider>{children}</ZustandProvider>
            </PreFetchDataProvider>
        </ConfirmationModalContextProvider>
    );
}

export default AuthenticatedOnlyContext;
