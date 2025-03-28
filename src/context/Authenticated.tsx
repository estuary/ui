import ConfirmationModalContextProvider from './Confirmation';
import { OnLoadSpinnerProvider } from './OnLoadSpinner/OnLoadSpinnerContext';
import QueryParamProvider from './QueryParam';
import { UserInfoSummaryStoreProvider } from './UserInfoSummary';

import AppGuards from 'src/app/guards';
import RequireAuth from 'src/context/Router/RequireAuth';
import { ZustandProvider } from 'src/context/Zustand/provider';
import { BaseComponentProps } from 'src/types';

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
