import useOpsLogs from 'hooks/journals/useOpsLogs';

import { useEffect } from 'react';
import { BaseComponentProps } from 'types';
import {
    useJournalDataLogsStore_hydrate,
    useJournalDataLogsStore_resetState,
    useJournalDataLogsStore_setActive,
} from './hooks';

interface Props extends BaseComponentProps {
    name: string;
    collectionName: string;
}

export const JournalDataLogsHydrator = ({
    name,
    collectionName,
    children,
}: Props) => {
    const resetState = useJournalDataLogsStore_resetState();
    const setActive = useJournalDataLogsStore_setActive();
    const hydrate = useJournalDataLogsStore_hydrate();

    const { docs, error, loading, oldestParsed, newestParsed, refresh } =
        useOpsLogs(name, collectionName);

    // More mount/unmount for store
    useEffect(() => {
        setActive(true);

        return () => {
            resetState();
        };
    }, [resetState, setActive]);

    // Initial hydrate call that handles errors, populates refresh, and defaults documents
    useEffect(() => {
        if (loading) {
            return;
        }
        hydrate(docs, refresh, oldestParsed, newestParsed, error);
    }, [docs, error, hydrate, loading, newestParsed, oldestParsed, refresh]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default JournalDataLogsHydrator;
