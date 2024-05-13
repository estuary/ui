import { Button } from '@mui/material';
import { CaptureQueryWithStats } from 'api/liveSpecsExt';
import CsvDownload from 'react-csv-downloader';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import { getFileName, tableExportSeparator } from '../shared';
import useExportColumns from '../useExportColumns';
import useCaptureExport from './useCaptureExport';

interface Props {
    data: CaptureQueryWithStats[];
}

function CaptureExportButton({ data }: Props) {
    const columns = useExportColumns();
    const generateExport = useCaptureExport(data);
    const noData = !hasLength(data);

    return (
        <CsvDownload
            columns={columns}
            datas={generateExport}
            disabled={noData}
            separator={tableExportSeparator}
            filename={getFileName('capture')}
        >
            <Button
                disabled={noData}
                variant="outlined"
                sx={{ whiteSpace: 'nowrap' }}
            >
                <FormattedMessage id="entityTable.download.cta" />
            </Button>
        </CsvDownload>
    );
}

export default CaptureExportButton;
