import type { Columns } from 'react-csv-downloader/dist/esm/lib/csv';

import { Button } from '@mui/material';

import CsvDownload from 'react-csv-downloader';
import { FormattedMessage } from 'react-intl';

import {
    generateFileName,
    tableExportSeparator,
} from 'src/components/tables/shared';

interface Props {
    columns: Columns;
    disabled: boolean;
    generateExport: () => Promise<any[]>;
    fileName: string;
}

function ExportButton({ columns, disabled, generateExport, fileName }: Props) {
    return (
        <CsvDownload
            columns={columns}
            datas={generateExport}
            disabled={disabled}
            separator={tableExportSeparator}
            filename={generateFileName(fileName)}
        >
            <Button
                disabled={disabled}
                variant="outlined"
                sx={{ whiteSpace: 'nowrap' }}
            >
                <FormattedMessage id="entityTable.download.cta" />
            </Button>
        </CsvDownload>
    );
}

export default ExportButton;
