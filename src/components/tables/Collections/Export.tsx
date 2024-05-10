import { Button } from '@mui/material';
import { CollectionQueryWithStats } from 'api/liveSpecsExt';
import CsvDownload from 'react-csv-downloader';
import { hasLength } from 'utils/misc-utils';
import { getFileName, tableExportSeparator } from '../shared';
import useCollectionExport from './useCollectionExport';

interface Props {
    data: CollectionQueryWithStats[];
}

function CollectionExportButton({ data }: Props) {
    const generateExport = useCollectionExport(data);
    const noData = !hasLength(data);

    return (
        <CsvDownload
            datas={generateExport}
            disabled={noData}
            separator={tableExportSeparator}
            filename={getFileName('collection')}
        >
            <Button disabled={noData} variant="outlined">
                Download
            </Button>
        </CsvDownload>
    );
}

export default CollectionExportButton;
