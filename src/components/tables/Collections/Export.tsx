import ExportButton from '../shared/ExportButton';
import useCollectionExport from './useCollectionExport';

import { CollectionQueryWithStats } from 'src/api/liveSpecsExt';

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
