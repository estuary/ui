import { Box } from '@mui/material';
import EntityTable from 'components/tables/EntityTable';

function CapturesTable() {
    return (
        <Box>
            <EntityTable
                noExistingDataContentIds={{
                    header: 'captures.main.message1',
                    message: 'captures.main.message2',
                    docLink: 'captures.main.message2.docLink',
                    docPath: 'captures.main.message2.docPath',
                }}
            />
        </Box>
    );
}

export default CapturesTable;
