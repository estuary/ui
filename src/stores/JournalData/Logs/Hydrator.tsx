import { maxBytes } from 'components/tables/Logs/shared';
import { useJournalData } from 'hooks/journals/useJournalData';

import { useEffect } from 'react';
import { BaseComponentProps } from 'types';
import {
    useJournalDataLogsStore_hydrate,
    useJournalDataLogsStore_resetState,
    useJournalDataLogsStore_setActive,
    useJournalDataLogsStore_setLoading,
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
    const setLoading = useJournalDataLogsStore_setLoading();

    // TODO (typing)
    //  need to handle typing
    const journalDataResponse = useJournalData(name, collectionName, {
        maxBytes,
    });

    useEffect(() => {
        setActive(true);

        if (!journalDataResponse.loading) {
            hydrate(journalDataResponse);
        }

        return () => {
            resetState();
        };
    }, [hydrate, journalDataResponse, resetState, setActive, setLoading]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default JournalDataLogsHydrator;
