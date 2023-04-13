import { PageTitleProps } from 'components/navigation/PageTitle';
import { useIntl } from 'react-intl';
import { useTitle } from 'react-use';
import {
    useTopBarStore_setHeader,
    useTopBarStore_setHeaderLink,
} from 'stores/TopBar/hooks';

function usePageTitle({ header, headerLink }: PageTitleProps) {
    const intl = useIntl();
    const setHeader = useTopBarStore_setHeader();
    const setHeaderLink = useTopBarStore_setHeaderLink();

    // This sets for the title in the TopBar
    setHeader(header);
    setHeaderLink(headerLink);

    // This sets the title inside the actual HTML file so the tab name changes
    useTitle(
        `${intl.formatMessage({
            id: 'common.browserTitle',
        })} · ${intl.formatMessage({
            id: header,
        })}`
    );
}

export default usePageTitle;
