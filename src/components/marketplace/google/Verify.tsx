import FullPageSpinner from 'components/fullPage/Spinner';
import { useEffect } from 'react';

function GoogleMarketplaceVerify() {
    useEffect(() => {
        console.log('need to make a call here');
    }, []);

    return <FullPageSpinner />;
}

export default GoogleMarketplaceVerify;
