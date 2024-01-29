import { TableFooter, TableRow, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    logsCount: number;
    hadNothingNew: boolean;
}

function LogsTableFooter({ logsCount, hadNothingNew }: Props) {
    return (
        <TableFooter component="div">
            <TableRow component="div" sx={{ height: 35 }}>
                {hadNothingNew ? (
                    <Typography>No new logs to display</Typography>
                ) : null}

                <Typography>
                    <FormattedMessage
                        id="ops.logsTable.footer.lines"
                        values={{
                            count: logsCount,
                        }}
                    />
                </Typography>
            </TableRow>
        </TableFooter>
    );
}

export default LogsTableFooter;
