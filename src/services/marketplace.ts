import { getMarketplaceSettings } from 'utils/env-utils';
import { client } from './client';

export const verifyMarketplaceSubscription = (id: string, tenant: string) => {
    const { verifyURL } = getMarketplaceSettings();
    return client(verifyURL, { data: { id, tenant } });
};
