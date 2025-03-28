import type { CollectionQueryWithStats } from 'src/api/liveSpecsExt';

import useCollectionExport from 'src/components/tables/Collections/useCollectionExport';
import ExportButton from 'src/components/tables/shared/ExportButton';

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
