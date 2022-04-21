import { useIntl } from 'react-intl';
import { useTitle } from 'react-use';

function useBrowserTitle(titleKey: string) {
    const intl = useIntl();
    useTitle(
        intl.formatMessage({
            id: titleKey,
        })
    );
}

export default useBrowserTitle;
