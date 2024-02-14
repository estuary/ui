import useOpsLogs from 'hooks/journals/useOpsLogs';

import { useEffect } from 'react';
import { BaseComponentProps } from 'types';
import {
    useJournalDataLogsStore_hydrate,
    useJournalDataLogsStore_resetState,
    useJournalDataLogsStore_setActive,
    useJournalDataLogsStore_setFetchingMore,
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

    const setFetchingMore = useJournalDataLogsStore_setFetchingMore();

    const {
        docs,
        error,
        loading,
        lastParsed,
        nothingInLastFetch,
        olderFinished,
        refresh,
    } = useOpsLogs(name, collectionName);

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
        hydrate(docs, refresh, olderFinished, lastParsed, error);
    }, [docs, error, hydrate, lastParsed, loading, olderFinished, refresh]);

    // If there was nothing in the last fetch go ahead and reset the fetching flags
    //  so that the waiting rows can kick off another poll
    useEffect(() => {
        if (nothingInLastFetch) {
            setFetchingMore(false);
        }
    }, [nothingInLastFetch, setFetchingMore]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default JournalDataLogsHydrator;
