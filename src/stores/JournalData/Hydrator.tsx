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

    const resetState = useJournalStore((state) => state.resetState);
    const getAuthToken = useJournalStore((state) => state.getAuthToken);

    useEffect(() => {
        return resetState();
    }, [resetState]);

    useEffect(() => {
        if (accessToken) {
            getAuthToken(accessToken, catalogName, isCollection);
        }
    }, [accessToken, catalogName, getAuthToken, isCollection]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}
