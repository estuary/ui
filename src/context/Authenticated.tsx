import ConfirmationModalContextProvider from 'context/Confirmation';
import { PreFetchDataProvider } from 'context/PreFetchData';
import { ZustandProvider } from 'context/Zustand/provider';
import { useMount, useUnmount } from 'react-use';
import { BaseComponentProps } from 'types';
import { getOsanoSettings } from 'utils/env-utils';

const { bodyClass } = getOsanoSettings();

// This is for contexts that should only be added to the app after the user has authenticated
function AuthenticatedOnlyContext({ children }: BaseComponentProps) {
    useMount(() => {
        document.body.classList.add(bodyClass);
    });

    useUnmount(() => {
        document.body.classList.remove(bodyClass);
    });

    return (
        <PreFetchDataProvider>
            <ZustandProvider>
                <ConfirmationModalContextProvider>
                    {children}
                </ConfirmationModalContextProvider>
            </ZustandProvider>
        </PreFetchDataProvider>
    );
}

export default AuthenticatedOnlyContext;
