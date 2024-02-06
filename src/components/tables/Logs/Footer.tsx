import {
    Divider,
    Stack,
    TableFooter,
    TableRow,
    Typography,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    logsCount: number;
}

function LogsTableFooter({ logsCount }: Props) {
    return (
        <TableFooter component="div">
            <TableRow component="div" sx={{ height: 35 }}>
                <Stack
                    direction="row"
                    divider={<Divider orientation="vertical" flexItem />}
                    spacing={2}
                >
                    <Typography>
                        <FormattedMessage
                            id="ops.logsTable.footer.lines"
                            values={{
                                count: logsCount,
                            }}
                        />
                    </Typography>
                </Stack>
            </TableRow>
        </TableFooter>
    );
}

export default LogsTableFooter;
