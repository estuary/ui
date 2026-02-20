import type { BaseComponentProps } from 'src/types';

import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';

import useOpsLogs from 'src/hooks/journals/useOpsLogs';
import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';

export const JournalDataLogsHydrator = ({ children }: BaseComponentProps) => {
    const [resetState, setActive, hydrate] = useJournalDataLogsStore(
        useShallow((state) => [state.resetState, state.setActive, state.hydrate])
    );

    const { docs, error, loading, readStatus, refresh } = useOpsLogs();

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
        hydrate(docs, refresh, readStatus, error);
    }, [docs, error, readStatus, hydrate, loading, refresh]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default JournalDataLogsHydrator;
