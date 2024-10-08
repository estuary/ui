import AppGuards from 'app/guards';
import { ZustandProvider } from 'context/Zustand/provider';
import { BaseComponentProps } from 'types';
import RequireAuth from 'context/Router/RequireAuth';
import { OnLoadSpinnerProvider } from './OnLoadSpinner/OnLoadSpinnerContext';
import QueryParamProvider from './QueryParam';
import { UserInfoSummaryStoreProvider } from './UserInfoSummary';
import ConfirmationModalContextProvider from './Confirmation';

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
