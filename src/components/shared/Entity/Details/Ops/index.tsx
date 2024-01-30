import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import JournalDataLogsHydrator from 'stores/JournalData/Logs/Hydrator';
import OpsTableWrapper from './TableWrapper';

function Ops() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const [name, collectionName] = useJournalNameForLogs(catalogName);

    return (
        <JournalDataLogsHydrator name={name} collectionName={collectionName}>
            <OpsTableWrapper />
        </JournalDataLogsHydrator>
    );
}

export default Ops;
