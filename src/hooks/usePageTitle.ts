import { useEffect } from 'react';

import { useTopBarStore } from 'src/stores/TopBar/Store';
import useBrowserTitle from './useBrowserTitle';

interface PageTitleProps {
    header: string;
    headerLink?: string;
}

function usePageTitle({ header, headerLink }: PageTitleProps) {
    const [setHeader, setHeaderLink] = useTopBarStore((state) => [
        state.setHeader,
        state.setHeaderLink,
    ]);

    useEffect(() => {
        // This sets for the title in the TopBar
        setHeader(header);
        setHeaderLink(headerLink);
    }, [header, headerLink, setHeader, setHeaderLink]);

    // This sets the title inside the actual HTML file so the tab name changes
    useBrowserTitle(header);
}

export default usePageTitle;
