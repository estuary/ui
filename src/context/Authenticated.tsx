import ConfirmationModalContextProvider from 'context/Confirmation';
import { ZustandProvider } from 'context/Zustand/provider';
import { useMount, useUnmount } from 'react-use';
import { BaseComponentProps } from 'types';
import { getOsanoSettings } from 'utils/env-utils';
import { DocsContextProvider } from './Docs';
import PreFetchDataProvider from './fetcher';

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
                <DocsContextProvider>
                    <ConfirmationModalContextProvider>
                        {children}
                    </ConfirmationModalContextProvider>
                </DocsContextProvider>
            </ZustandProvider>
        </PreFetchDataProvider>
    );
}

export default AuthenticatedOnlyContext;
