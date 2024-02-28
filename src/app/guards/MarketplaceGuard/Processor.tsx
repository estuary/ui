import FullPageSpinner from 'components/fullPage/Spinner';

interface Props {
    accountId: string;
}

function MarketplaceGuardProcessor({ accountId }: Props) {
    console.log('accountId', accountId);
    return <FullPageSpinner />;
}

export default MarketplaceGuardProcessor;
