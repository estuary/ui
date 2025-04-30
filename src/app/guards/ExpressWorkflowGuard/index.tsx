import type { ExpressWorkflowGuardProps } from 'src/app/guards/types';

import { useEffect } from 'react';

import { ConnectorGridSkeleton } from 'src/app/guards/ExpressWorkflowGuard/ConnectorGridSkeleton';
import { FormSkeleton } from 'src/app/guards/ExpressWorkflowGuard/FormSkeleton';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import useExpressWorkflowAuth from 'src/hooks/useExpressWorkflowAuth';
import { logRocketConsole } from 'src/services/shared';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const ExpressWorkflowGuard = ({
    authenticating,
    children,
}: ExpressWorkflowGuardProps) => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const { getExpressWorkflowAuth } = useExpressWorkflowAuth();

    const stateEmpty = useWorkflowStore(
        (state) =>
            !state.catalogName.whole || !state.customerId || !state.redirectUrl
    );
    const resetState = useWorkflowStore((state) => state.resetState);
    const setCatalogName = useWorkflowStore((state) => state.setCatalogName);
    const setCustomerId = useWorkflowStore((state) => state.setCustomerId);
    const setHydrationErrorsExist = useWorkflowStore(
        (state) => state.setHydrationErrorsExist
    );
    const setRedirectUrl = useWorkflowStore((state) => state.setRedirectUrl);

    useEffect(() => {
        if (!authenticating.current && stateEmpty) {
            authenticating.current = true;
            resetState();

            getExpressWorkflowAuth().then(
                ({ customerId, prefix, redirectURL }) => {
                    setCatalogName({ root: customerId, tenant: prefix });
                    setCustomerId(customerId);
                    setRedirectUrl(redirectURL);
                },
                (error) => {
                    setHydrationErrorsExist(true);

                    logRocketConsole('Failed to authenticate workflow', error);
                }
            );
        }
    }, [
        authenticating,
        getExpressWorkflowAuth,
        resetState,
        setCatalogName,
        setCustomerId,
        setHydrationErrorsExist,
        setRedirectUrl,
        stateEmpty,
    ]);

    if (authenticating && stateEmpty) {
        return connectorId ? <FormSkeleton /> : <ConnectorGridSkeleton />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
