import AppGuards from 'app/guards';
import ConfirmationModalContextProvider from 'context/Confirmation';
import { ZustandProvider } from 'context/Zustand/provider';
import { BaseComponentProps } from 'types';
import AuthEvents from './AuthEvents';
import PreFetchDataProvider from './fetcher';
import { OnLoadSpinnerProvider } from './OnLoadSpinner/OnLoadSpinnerContext';
import OnLoadSpinnerShow from './OnLoadSpinner/OnLoadSpinnerShow';
import Osano from './Osano';
import QueryParamProvider from './QueryParam';
import RequireAuth from './Router/RequireAuth';

// This includes some Guards as well as the contexts we only ever want
//      loaded when a user is logged in.
export function AuthenticatedOnlyContext({ children }: BaseComponentProps) {
    return (
        <RequireAuth>
            <OnLoadSpinnerProvider>
                <Osano>
                    <QueryParamProvider>
                        <ZustandProvider>
                            <OnLoadSpinnerShow>
                                <AppGuards>
                                    <AuthEvents>
                                        <PreFetchDataProvider>
                                            <ConfirmationModalContextProvider>
                                                {children}
                                            </ConfirmationModalContextProvider>
                                        </PreFetchDataProvider>
                                    </AuthEvents>
                                </AppGuards>
                            </OnLoadSpinnerShow>
                        </ZustandProvider>
                    </QueryParamProvider>
                </Osano>
            </OnLoadSpinnerProvider>
        </RequireAuth>
    );
}
