import { useIntl } from 'react-intl';

function CardHeader() {
    const intl = useIntl();

    return (
        <>
            {intl.formatMessage({
                id: 'supportConsent.enhancedSupport.title',
            })}
        </>
    );
}

export default CardHeader;
