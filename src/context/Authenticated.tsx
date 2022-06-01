import ConfirmationModalContextProvider from 'context/Confirmation';
import { PreFetchDataProvider } from 'context/PreFetchData';
import { BaseComponentProps } from 'types';

// This is for contexts that should only be added to the app after the user has authenticated
function AuthenticatedOnlyContext({ children }: BaseComponentProps) {
    return (
        <ConfirmationModalContextProvider>
            <PreFetchDataProvider>{children}</PreFetchDataProvider>
        </ConfirmationModalContextProvider>
    );
}

export default AuthenticatedOnlyContext;
