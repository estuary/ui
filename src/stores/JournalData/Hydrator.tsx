import type { HydratorProps } from './types';
import { useUserStore } from 'context/User/useUserContextStore';
import { useEffect } from 'react';
import { useUnmount } from 'react-use';
import useJournalStore from './Store';

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
