import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';

import useBrowserTitle from 'src/hooks/useBrowserTitle';
import { useTopBarStore } from 'src/stores/TopBar/Store';

interface PageTitleProps {
    header: string;
    headerDetail?: string;
    headerLink?: string;
}

function usePageTitle({ header, headerDetail, headerLink }: PageTitleProps) {
    const [setHeader, setHeaderDetail, setHeaderLink] = useTopBarStore(
        useShallow((state) => [
            state.setHeader,
            state.setHeaderDetail,
            state.setHeaderLink,
        ])
    );

    useEffect(() => {
        // This sets for the title in the TopBar
        setHeader(header);
        setHeaderDetail(headerDetail);
        setHeaderLink(headerLink);
    }, [
        header,
        headerDetail,
        headerLink,
        setHeader,
        setHeaderDetail,
        setHeaderLink,
    ]);

    // This sets the title inside the actual HTML file so the tab name changes
    useBrowserTitle(header);
}

export default usePageTitle;
