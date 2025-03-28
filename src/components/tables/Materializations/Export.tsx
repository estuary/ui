import ExportButton from '../shared/ExportButton';
import useMaterializationExport from './useMaterializationExport';

import { MaterializationQueryWithStats } from 'src/api/liveSpecsExt';

interface Props {
    data: MaterializationQueryWithStats[];
}

function MaterializationExportButton({ data }: Props) {
    const { columns, generateExport, noData } = useMaterializationExport(data);

    return (
        <ExportButton
            columns={columns}
            disabled={noData}
            generateExport={generateExport}
            fileName="materializations_table"
        />
    );
}

export default MaterializationExportButton;
