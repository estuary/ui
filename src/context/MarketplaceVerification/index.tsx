import FullPageWrapper from 'app/FullPageWrapper';
import useGoogleMarketplaceParams from 'hooks/searchParams/marketplace/useGoogleMarketplaceParams';

import { BaseComponentProps } from 'types';
import MarketplaceVerificationProcessor from './Processor';

function MarketplaceVerification({ children }: BaseComponentProps) {
    const marketPlaceParams = useGoogleMarketplaceParams();

    if (marketPlaceParams.account_id) {
        return (
            <FullPageWrapper>
                <MarketplaceVerificationProcessor
                    accountId={marketPlaceParams.account_id}
                />
            </FullPageWrapper>
        );
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default MarketplaceVerification;
