import lightDemo from 'images/demo.svg';
import { useIntl } from 'react-intl';

function DemoImage() {
    const intl = useIntl();

    return (
        <img
            src={lightDemo}
            style={{ marginBottom: 16 }}
            width="75%"
            alt={intl.formatMessage({ id: 'welcome.image.alt' })}
        />
    );
}

export default DemoImage;
