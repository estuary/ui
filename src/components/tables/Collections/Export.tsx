import { CollectionQueryWithStats } from 'api/liveSpecsExt';
import { hasLength } from 'utils/misc-utils';
import ExportButton from '../shared/ExportButton';
import useCollectionExport from './useCollectionExport';

interface Props {
    data: CollectionQueryWithStats[];
}

function CollectionExportButton({ data }: Props) {
    const { columns, generateExport } = useCollectionExport(data);
    const noData = !hasLength(data);

    return (
        <ExportButton
            columns={columns}
            disabled={noData}
            generateExport={generateExport}
            fileName="collections_table"
        />
    );
}

export default CollectionExportButton;
