import { maxBytes } from 'components/tables/Logs/shared';
import { useJournalData } from 'hooks/journals/useJournalData';

import { useEffect } from 'react';
import { BaseComponentProps } from 'types';
import {
    useJournalDataLogsStore_hydrate,
    useJournalDataLogsStore_setHydrationErrorsExist,
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
    const hydrate = useJournalDataLogsStore_hydrate();
    const setLoading = useJournalDataLogsStore_setLoading();
    const setHydrationErrorsExist =
        useJournalDataLogsStore_setHydrationErrorsExist();

    // TODO (typing)
    //  need to handle typing
    const journalDataResponse = useJournalData(name, collectionName, {
        maxBytes,
    });

    useEffect(() => {
        setLoading(journalDataResponse.loading);

        if (journalDataResponse.error) {
            setHydrationErrorsExist(true);
            return;
        }

        hydrate(journalDataResponse);
    }, [hydrate, journalDataResponse, setHydrationErrorsExist, setLoading]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default JournalDataLogsHydrator;
