import type { BaseComponentProps } from 'src/types';

import { useEffect } from 'react';

import { ConnectorGridSkeleton } from 'src/app/guards/ExpressWorkflowGuard/ConnectorGridSkeleton';
import { FormSkeleton } from 'src/app/guards/ExpressWorkflowGuard/FormSkeleton';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import useExpressWorkflowAuth from 'src/hooks/useExpressWorkflowAuth';
import { logRocketConsole } from 'src/services/shared';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const ExpressWorkflowGuard = ({ children }: BaseComponentProps) => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const { getExpressWorkflowAuth } = useExpressWorkflowAuth();

    const authenticating = useWorkflowStore((state) => state.authenticating);
    const stateEmpty = useWorkflowStore(
        (state) =>
            !state.catalogName.whole || !state.customerId || !state.redirectUrl
    );
    const setAuthenticating = useWorkflowStore(
        (state) => state.setAuthenticating
    );
    const setCatalogName = useWorkflowStore((state) => state.setCatalogName);
    const setCustomerId = useWorkflowStore((state) => state.setCustomerId);
    const setHydrationErrorsExist = useWorkflowStore(
        (state) => state.setHydrationErrorsExist
    );
    const setRedirectUrl = useWorkflowStore((state) => state.setRedirectUrl);

    useEffect(() => {
        if (!authenticating && stateEmpty) {
            setAuthenticating(true);

            getExpressWorkflowAuth()
                .then(
                    ({ customerId, prefix, redirectURL }) => {
                        setCatalogName([
                            { key: 'tenant', value: prefix },
                            { key: 'root', value: customerId },
                        ]);
                        setCustomerId(customerId);
                        setRedirectUrl(redirectURL);
                    },
                    (error) => {
                        setHydrationErrorsExist(true);

                        logRocketConsole(
                            'Failed to authenticate workflow',
                            error
                        );
                    }
                )
                .finally(() => {
                    setAuthenticating(false);
                });
        }
    }, [
        authenticating,
        getExpressWorkflowAuth,
        stateEmpty,
        setAuthenticating,
        setCatalogName,
        setCustomerId,
        setHydrationErrorsExist,
        setRedirectUrl,
    ]);

    if (authenticating && stateEmpty) {
        return connectorId ? <FormSkeleton /> : <ConnectorGridSkeleton />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
