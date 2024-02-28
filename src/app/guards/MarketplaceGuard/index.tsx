import useGoogleMarketplaceParams from 'hooks/searchParams/marketplace/useGoogleMarketplaceParams';

import { BaseComponentProps } from 'types';
import MarketplaceGuardProcessor from './Processor';

function MarketplaceGuard({ children }: BaseComponentProps) {
    const marketPlaceParams = useGoogleMarketplaceParams();

    if (marketPlaceParams.account_id) {
        return (
            <MarketplaceGuardProcessor
                accountId={marketPlaceParams.account_id}
            />
        );
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default MarketplaceGuard;
