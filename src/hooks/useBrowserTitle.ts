import { useIntl } from 'react-intl';
import { useTitle } from 'react-use';

function useBrowserTitle(titleKey: string) {
    const intl = useIntl();
    useTitle(
        `${intl.formatMessage({
            id: 'common.browserTitle',
        })} · ${intl.formatMessage({
            id: titleKey,
        })}`
    );
}

export default useBrowserTitle;
