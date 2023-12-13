import AppGuards from 'app/guards';
import ConfirmationModalContextProvider from 'context/Confirmation';
import { ZustandProvider } from 'context/Zustand/provider';
import { BaseComponentProps } from 'types';
import { OnLoadSpinnerProvider } from './OnLoadSpinner/OnLoadSpinnerContext';
import Osano from './Osano';
import QueryParamProvider from './QueryParam';
import RequireAuth from './Router/RequireAuth';
import PreFetchDataProvider from './fetcher';

interface Props extends BaseComponentProps {
    hideSpinner?: boolean;
}

// This includes some Guards as well as the contexts we only ever want
//      loaded when a user is logged in.
export function AuthenticatedOnlyContext({ children, hideSpinner }: Props) {
    return (
        <RequireAuth>
            <Osano>
                <OnLoadSpinnerProvider defaultState={!hideSpinner}>
                    <QueryParamProvider>
                        <ZustandProvider>
                            <AppGuards>
                                <PreFetchDataProvider>
                                    <ConfirmationModalContextProvider>
                                        {children}
                                    </ConfirmationModalContextProvider>
                                </PreFetchDataProvider>
                            </AppGuards>
                        </ZustandProvider>
                    </QueryParamProvider>
                </OnLoadSpinnerProvider>
            </Osano>
        </RequireAuth>
    );
}
