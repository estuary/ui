import { Box, TableCell, TableRow } from '@mui/material';
import { useToggle } from 'react-use';
import { OpsLogFlowDocument } from 'types';
import { FormattedMessage } from 'react-intl';
import LevelCell from '../cells/logs/LevelCell';
import TimestampCell from '../cells/logs/TimestampCell';
import MessageCell from '../cells/logs/MessageCell';
import LevelIcon from '../cells/logs/LevelIcon';

interface RowProps {
    row: OpsLogFlowDocument;
    style?: any;
}

interface RowsProps {
    data: OpsLogFlowDocument[];
    loading?: boolean;
    hitFileStart?: boolean;
}

export function Row({ row, style }: RowProps) {
    const hasFields = Boolean(row.fields);
    const [expanded, toggleExpanded] = useToggle(false);

    return (
        <TableRow
            component={Box}
            hover={hasFields}
            aria-expanded={hasFields ? expanded : undefined}
            style={style}
            sx={{
                cursor: hasFields ? 'pointer' : undefined,
            }}
            onClick={
                hasFields
                    ? () => {
                          toggleExpanded();
                      }
                    : undefined
            }
        >
            <LevelCell
                disableExpand={!hasFields}
                expanded={expanded}
                row={row}
            />

            <TimestampCell ts={row.ts} />

            <MessageCell message={row.message} fields={row.fields} />
        </TableRow>
    );
}

function Rows({ data, loading, hitFileStart }: RowsProps) {
    return (
        <>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={3}>
                        <FormattedMessage id="ops.logsTable.fetchingOlderLogs" />
                    </TableCell>
                </TableRow>
            ) : null}
            {hitFileStart ? (
                <TableRow>
                    <TableCell align="right">
                        <LevelIcon level="done" />
                    </TableCell>
                    <TableCell colSpan={2}>
                        <FormattedMessage id="ops.logsTable.allOldLogsLoaded" />
                    </TableCell>
                </TableRow>
            ) : null}
            {data.map((record) => (
                <Row row={record} key={record._meta.uuid} />
            ))}
        </>
    );
}

export default Rows;
