import { useEffect } from 'react';

import { useUnmount } from 'react-use';
import { useUserStore } from 'src/context/User/useUserContextStore';
import useJournalStore from 'src/stores/JournalData/Store';
import type { HydratorProps } from 'src/stores/JournalData/types';


export default function JournalHydrator({
    catalogName,
    children,
    isCollection,
}: HydratorProps) {
    const accessToken = useUserStore((state) => state.session?.access_token);

    const resetState = useJournalStore((state) => state.resetState);
    const getAuthToken = useJournalStore((state) => state.getAuthToken);

    useUnmount(() => {
        resetState();
    });

    useEffect(() => {
        if (accessToken) {
            void getAuthToken(accessToken, catalogName, isCollection);
        }
    }, [accessToken, catalogName, getAuthToken, isCollection]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}
