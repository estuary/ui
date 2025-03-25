import type { CollectionQueryWithStats } from 'api/liveSpecsExt';
import ExportButton from '../shared/ExportButton';
import useCollectionExport from './useCollectionExport';

interface Props {
    data: CollectionQueryWithStats[];
}

function CollectionExportButton({ data }: Props) {
    const { columns, generateExport, noData } = useCollectionExport(data);

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
