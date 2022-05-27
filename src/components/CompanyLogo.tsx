import lightLogo from 'images/light-horizontal/estuary-logo.png';
import { useIntl } from 'react-intl';

function CompanyLogo() {
    const intl = useIntl();
    return (
        <img
            src={lightLogo}
            style={{ marginBottom: 16 }}
            width={200}
            alt={intl.formatMessage({ id: 'company' })}
        />
    );
}

export default CompanyLogo;
