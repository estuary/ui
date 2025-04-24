import type { BaseComponentProps } from 'src/types';

import AppGuards from 'src/app/guards';
import ConfirmationModalContextProvider from 'src/context/Confirmation';
import { OnLoadSpinnerProvider } from 'src/context/OnLoadSpinner/OnLoadSpinnerContext';
import QueryParamProvider from 'src/context/QueryParam';
import RequireAuth from 'src/context/Router/RequireAuth';
import { UserInfoSummaryStoreProvider } from 'src/context/UserInfoSummary';
import { ZustandProvider } from 'src/context/Zustand/provider';

interface Props extends BaseComponentProps {
    hideSpinner?: boolean;
}

// This includes some Guards as well as the contexts we only ever want
//      loaded when a user is logged in.
export function AuthenticatedOnlyContext({ children, hideSpinner }: Props) {
    return (
        <RequireAuth>
            <OnLoadSpinnerProvider defaultState={!hideSpinner}>
                <QueryParamProvider>
                    <ZustandProvider>
                        <UserInfoSummaryStoreProvider>
                            <AppGuards>
                                <ConfirmationModalContextProvider>
                                    {children}
                                </ConfirmationModalContextProvider>
                            </AppGuards>
                        </UserInfoSummaryStoreProvider>
                    </ZustandProvider>
                </QueryParamProvider>
            </OnLoadSpinnerProvider>
        </RequireAuth>
    );
}
