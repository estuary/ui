import { Button } from '@mui/material';
import { CaptureQueryWithStats } from 'api/liveSpecsExt';
import { DateTime } from 'luxon';
import CsvDownload from 'react-csv-downloader';
import useCaptureExport from './useCaptureExport';

interface Props {
    data: CaptureQueryWithStats[];
}

function CaptureExportButton({ data }: Props) {
    console.log('data', data);

    const generateCaptureExport = useCaptureExport(data);
    return (
        <CsvDownload
            datas={generateCaptureExport}
            filename={`estuary_capture_table_${DateTime.now().toFormat(
                'yyyy-MM-dd_HH:mm:ss'
            )}`}
        >
            <Button>Download</Button>
        </CsvDownload>
    );
}

export default CaptureExportButton;
