import { useEffect } from 'react';

import {
    useTopBarStore_setHeader,
    useTopBarStore_setHeaderLink,
} from 'stores/TopBar/hooks';

import useBrowserTitle from './useBrowserTitle';

interface PageTitleProps {
    header: string;
    headerLink?: string;
}

function usePageTitle({ header, headerLink }: PageTitleProps) {
    const setHeader = useTopBarStore_setHeader();
    const setHeaderLink = useTopBarStore_setHeaderLink();

    useEffect(() => {
        // This sets for the title in the TopBar
        setHeader(header);
        setHeaderLink(headerLink);
    }, [header, headerLink, setHeader, setHeaderLink]);

    // This sets the title inside the actual HTML file so the tab name changes
    useBrowserTitle(header);
}

export default usePageTitle;
