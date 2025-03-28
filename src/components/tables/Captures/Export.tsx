import { CaptureQueryWithStats } from 'src/api/liveSpecsExt';
import ExportButton from '../shared/ExportButton';
import useCaptureExport from './useCaptureExport';

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
