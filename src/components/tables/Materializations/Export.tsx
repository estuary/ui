import { Button } from '@mui/material';
import { MaterializationQueryWithStats } from 'api/liveSpecsExt';
import CsvDownload from 'react-csv-downloader';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import { generateFileName, tableExportSeparator } from '../shared';
import useMaterializationExport from './useMaterializationExport';

interface Props {
    data: MaterializationQueryWithStats[];
}

function MaterializationExportButton({ data }: Props) {
    const { columns, generateExport } = useMaterializationExport(data);
    const noData = !hasLength(data);

    return (
        <CsvDownload
            columns={columns}
            datas={generateExport}
            disabled={noData}
            separator={tableExportSeparator}
            filename={generateFileName('materializations_table')}
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

export default MaterializationExportButton;
