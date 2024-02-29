import { Session } from '@supabase/supabase-js';
import { Auth } from '@supabase/ui';
import { useCallback } from 'react';
import { client } from 'services/client';
import { MarketPlaceVerifyResponse } from 'types';
import { getMarketplaceSettings } from 'utils/env-utils';
import retry from 'retry';
import { logRocketEvent, retryAfterFailure } from 'services/shared';
import { CustomEvents } from 'services/types';
import { handleFailure, handleSuccess } from 'services/supabase';

const { verifyURL } = getMarketplaceSettings();

export const fetcher = (tenant: string, session: Session | null) => {
    return client<MarketPlaceVerifyResponse>(
        verifyURL,
        { data: { tenant, token: session?.provider_token } },
        session?.access_token
    );
};

interface MarketplaceVerifyResponse {
    data: MarketPlaceVerifyResponse | null;
    error?: any;
}

const useMarketplaceVerify = () => {
    const { session } = Auth.useUser();

    return useCallback(
        (tenant: string) => {
            const operation = retry.operation({
                retries: 2,
                randomize: true,
            });

            //MarketPlaceVerifyResponse
            return new Promise<MarketplaceVerifyResponse>((resolve) => {
                operation.attempt(async () => {
                    const response = await fetcher(tenant, session).then(
                        handleSuccess<MarketPlaceVerifyResponse>,
                        handleFailure
                    );

                    const error = response.error;

                    if (
                        retryAfterFailure(error?.message) &&
                        operation.retry(error)
                    ) {
                        logRocketEvent(CustomEvents.MARKETPLACE_VERIFY_FAILED);
                        return;
                    }

                    resolve(response);
                });
            });
        },
        [session]
    );
};

export default useMarketplaceVerify;
