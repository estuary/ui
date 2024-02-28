import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { BaseComponentProps } from 'types';
import MarketplaceGuardProcessor from './Processor';

function MarketplaceGuard({ children }: BaseComponentProps) {
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);

    if (grantToken) {
        return <MarketplaceGuardProcessor />;
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default MarketplaceGuard;
