import { Button } from '@mui/material';
import { MaterializationQueryWithStats } from 'api/liveSpecsExt';
import CsvDownload from 'react-csv-downloader';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import { getFileName, tableExportSeparator } from '../shared';
import useExportColumns from '../useExportColumns';
import useMaterializationExport from './useMaterializationExport';

interface Props {
    data: MaterializationQueryWithStats[];
}

function MaterializationExportButton({ data }: Props) {
    const columns = useExportColumns();
    const generateExport = useMaterializationExport(data);
    const noData = !hasLength(data);

    return (
        <CsvDownload
            columns={columns}
            datas={generateExport}
            disabled={noData}
            separator={tableExportSeparator}
            filename={getFileName('materialization')}
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
