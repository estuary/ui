import type { MaterializationQueryWithStats } from 'src/api/liveSpecsExt';
import ExportButton from 'src/components/tables/shared/ExportButton';
import useMaterializationExport from 'src/components/tables/Materializations/useMaterializationExport';


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
