import useOpsLogs from 'hooks/journals/useOpsLogs';

import { useEffect } from 'react';
import { BaseComponentProps } from 'types';

import { useJournalDataLogsStore } from './Store';

export const JournalDataLogsHydrator = ({ children }: BaseComponentProps) => {
    const [resetState, setActive, hydrate] = useJournalDataLogsStore(
        (state) => [state.resetState, state.setActive, state.hydrate]
    );

    const { docs, error, loading, refresh } = useOpsLogs();

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
        hydrate(docs, refresh, error);
    }, [docs, error, hydrate, loading, refresh]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default JournalDataLogsHydrator;
