import { Button } from '@mui/material';
import { MaterializationQueryWithStats } from 'api/liveSpecsExt';
import CsvDownload from 'react-csv-downloader';
import { hasLength } from 'utils/misc-utils';
import { getFileName, tableExportSeparator } from '../shared';
import useMaterializationExport from './useMaterializationExport';

interface Props {
    data: MaterializationQueryWithStats[];
}

function MaterializationExportButton({ data }: Props) {
    const generateExport = useMaterializationExport(data);
    const noData = !hasLength(data);

    return (
        <CsvDownload
            datas={generateExport}
            disabled={noData}
            separator={tableExportSeparator}
            filename={getFileName('materialization')}
        >
            <Button disabled={noData} variant="outlined">
                Download
            </Button>
        </CsvDownload>
    );
}

export default MaterializationExportButton;
