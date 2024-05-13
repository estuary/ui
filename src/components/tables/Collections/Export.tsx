import { Button } from '@mui/material';
import { CollectionQueryWithStats } from 'api/liveSpecsExt';
import CsvDownload from 'react-csv-downloader';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import { generateFileName, tableExportSeparator } from '../shared';
import useCollectionExport from './useCollectionExport';

interface Props {
    data: CollectionQueryWithStats[];
}

function CollectionExportButton({ data }: Props) {
    const { columns, generateExport } = useCollectionExport(data);
    const noData = !hasLength(data);

    return (
        <CsvDownload
            columns={columns}
            datas={generateExport}
            disabled={noData}
            separator={tableExportSeparator}
            filename={generateFileName('collections_table')}
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

export default CollectionExportButton;
