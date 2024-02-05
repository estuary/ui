import useOpsLogs from 'hooks/journals/useOpsLogs';

import { useEffect } from 'react';
import { BaseComponentProps } from 'types';
import {
    useJournalDataLogsStore_hydrate,
    useJournalDataLogsStore_hydrated,
    useJournalDataLogsStore_resetState,
    useJournalDataLogsStore_setActive,
    useJournalDataLogsStore_addNewDocuments,
    useJournalDataLogsStore_setFetchingOlder,
    useJournalDataLogsStore_setFetchingNewer,
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
    const hydrated = useJournalDataLogsStore_hydrated();

    const addNewDocuments = useJournalDataLogsStore_addNewDocuments();
    const setFetchingOlder = useJournalDataLogsStore_setFetchingOlder();
    const setFetchingNewer = useJournalDataLogsStore_setFetchingNewer();

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
        if (loading || hydrated) {
            return;
        }
        hydrate(docs, refresh, olderFinished, lastParsed, error);
    }, [
        docs,
        error,
        hydrate,
        hydrated,
        lastParsed,
        loading,
        olderFinished,
        refresh,
    ]);

    // Maintain documents after the inital hydration
    useEffect(() => {
        if (!hydrated) {
            return;
        }
        addNewDocuments(docs, olderFinished, lastParsed);
    }, [docs, hydrated, lastParsed, olderFinished, addNewDocuments]);

    // If there was nothing in the last fetch go ahead and reset the fetching flags
    useEffect(() => {
        if (nothingInLastFetch) {
            setFetchingNewer(false);
            setFetchingOlder(false);
        }
    }, [nothingInLastFetch, setFetchingNewer, setFetchingOlder]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default JournalDataLogsHydrator;
