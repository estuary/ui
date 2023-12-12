import AppGuards from 'app/guards';
import ConfirmationModalContextProvider from 'context/Confirmation';
import { SidePanelDocsProvider } from 'context/SidePanelDocs';
import { ZustandProvider } from 'context/Zustand/provider';
import { BaseComponentProps } from 'types';
import { OnLoadSpinnerProvider } from './OnLoadSpinner/OnLoadSpinnerContext';
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
            <OnLoadSpinnerProvider defaultState={!hideSpinner}>
                <QueryParamProvider>
                    <ZustandProvider>
                        <AppGuards>
                            <PreFetchDataProvider>
                                <ConfirmationModalContextProvider>
                                    <SidePanelDocsProvider>
                                        {children}
                                    </SidePanelDocsProvider>
                                </ConfirmationModalContextProvider>
                            </PreFetchDataProvider>
                        </AppGuards>
                    </ZustandProvider>
                </QueryParamProvider>
            </OnLoadSpinnerProvider>
        </RequireAuth>
    );
}
