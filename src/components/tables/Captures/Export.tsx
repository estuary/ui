import { CaptureQueryWithStats } from 'api/liveSpecsExt';
import { hasLength } from 'utils/misc-utils';
import ExportButton from '../shared/ExportButton';
import useCaptureExport from './useCaptureExport';

interface Props {
    data: CaptureQueryWithStats[];
}

// TODO (export) We could make these all pull from the same root and pass
//  properties into them
function CaptureExportButton({ data }: Props) {
    const { columns, generateExport } = useCaptureExport(data);
    const noData = !hasLength(data);

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
