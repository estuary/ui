import type { BaseComponentProps } from 'src/types';

import { useEffect, useRef } from 'react';

import { ConnectorGridSkeleton } from 'src/app/guards/ExpressWorkflowGuard/ConnectorGridSkeleton';
import { FormSkeleton } from 'src/app/guards/ExpressWorkflowGuard/FormSkeleton';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import useExpressWorkflowAuth from 'src/hooks/useExpressWorkflowAuth';
import { logRocketConsole } from 'src/services/shared';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const ExpressWorkflowGuard = ({ children }: BaseComponentProps) => {
    const authenticating = useRef(false);

    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const { getExpressWorkflowAuth } = useExpressWorkflowAuth();

    const stateEmpty = useWorkflowStore(
        (state) =>
            !state.catalogName.whole || !state.customerId || !state.redirectUrl
    );
    const setCatalogName = useWorkflowStore((state) => state.setCatalogName);
    const setCustomerId = useWorkflowStore((state) => state.setCustomerId);
    const setHydrationErrorsExist = useWorkflowStore(
        (state) => state.setHydrationErrorsExist
    );
    const setRedirectUrl = useWorkflowStore((state) => state.setRedirectUrl);

    useEffect(() => {
        if (!authenticating.current && stateEmpty) {
            authenticating.current = true;

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
                    authenticating.current = false;
                });
        }
    }, [
        authenticating,
        getExpressWorkflowAuth,
        stateEmpty,
        setCatalogName,
        setCustomerId,
        setHydrationErrorsExist,
        setRedirectUrl,
    ]);

    if (authenticating.current && stateEmpty) {
        return connectorId ? <FormSkeleton /> : <ConnectorGridSkeleton />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
