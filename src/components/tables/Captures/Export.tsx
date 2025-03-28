import type { CaptureQueryWithStats } from 'src/api/liveSpecsExt';
import ExportButton from 'src/components/tables/shared/ExportButton';
import useCaptureExport from 'src/components/tables/Captures/useCaptureExport';


interface Props {
    data: CaptureQueryWithStats[];
}

function CaptureExportButton({ data }: Props) {
    const { columns, generateExport, noData } = useCaptureExport(data);

    return (
        <ExportButton
            columns={columns}
            disabled={noData}
            generateExport={generateExport}
            fileName="captures_table"
        />
    );
}

export default CaptureExportButton;
