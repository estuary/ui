import type { Session } from '@supabase/supabase-js';
import type { MarketPlaceVerifyResponse } from 'types';
import { useCallback } from 'react';
import { client } from 'services/client';
import { getMarketplaceSettings } from 'utils/env-utils';
import retry from 'retry';
import { logRocketEvent, retryAfterFailure } from 'services/shared';
import { CustomEvents } from 'services/types';
import { handleFailure, handleSuccess } from 'services/supabase';
import { useUserStore } from 'context/User/useUserContextStore';

const { verifyURL } = getMarketplaceSettings();

export const fetcher = (tenant: string, session: Session | null) => {
    return client<MarketPlaceVerifyResponse>(
        verifyURL,
        { data: { tenant, token: session?.provider_token } },
        session?.access_token,
        true
    );
};

interface MarketplaceVerifyResponse {
    data: MarketPlaceVerifyResponse | null;
    error?: {
        message: string;
    };
}

const useMarketplaceVerify = () => {
    const session = useUserStore((state) => state.session);

    return useCallback(
        (tenant: string) => {
            const operation = retry.operation({
                retries: 2,
                randomize: true,
                maxTimeout: 15000,
            });

            return new Promise<MarketplaceVerifyResponse>((resolve, reject) => {
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
                        logRocketEvent(CustomEvents.MARKETPLACE_VERIFY, {
                            status: 'retry',
                            message: error?.message,
                        });
                        return;
                    }

                    if (error) {
                        reject(error);
                    } else {
                        resolve(response);
                    }
                });
            });
        },
        [session]
    );
};

export default useMarketplaceVerify;
