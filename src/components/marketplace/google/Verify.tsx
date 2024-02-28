import FullPageSpinner from 'components/fullPage/Spinner';
import useGoogleMarketplaceParams from 'hooks/searchParams/marketplace/useGoogleMarketplaceParams';
import { useEffect } from 'react';

function GoogleMarketplaceVerify() {
    const params = useGoogleMarketplaceParams();

    useEffect(() => {
        console.log('params', params);
        console.log('need to make a call here');
    }, [params]);

    return <FullPageSpinner />;
}

export default GoogleMarketplaceVerify;
