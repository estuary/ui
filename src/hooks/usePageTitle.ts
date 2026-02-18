import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';

import useBrowserTitle from 'src/hooks/useBrowserTitle';
import { useTopBarStore } from 'src/stores/TopBar/Store';

interface PageTitleProps {
    header: string;
    headerLink?: string;
}

function usePageTitle({ header, headerLink }: PageTitleProps) {
    const [setHeader, setHeaderLink] = useTopBarStore(
        useShallow((state) => [state.setHeader, state.setHeaderLink])
    );

    useEffect(() => {
        // This sets for the title in the TopBar
        setHeader(header);
        setHeaderLink(headerLink);
    }, [header, headerLink, setHeader, setHeaderLink]);

    // This sets the title inside the actual HTML file so the tab name changes
    useBrowserTitle(header);
}

export default usePageTitle;
