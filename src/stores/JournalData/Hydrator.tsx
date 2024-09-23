import { useUserStore } from 'context/User/useUserContextStore';
import { useEffect } from 'react';
import useJournalStore from './Store';
import { HydratorProps } from './types';

export default function JournalHydrator({
    catalogName,
    children,
    isCollection,
}: HydratorProps) {
    const accessToken = useUserStore((state) => state.session?.access_token);
    const getAuthToken = useJournalStore((state) => state.getAuthToken);

    useEffect(() => {
        if (accessToken) {
            void getAuthToken(accessToken, catalogName, isCollection);
        }
    }, [accessToken, catalogName, getAuthToken, isCollection]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}
