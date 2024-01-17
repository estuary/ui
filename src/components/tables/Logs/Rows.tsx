import { TableCell, TableRow } from '@mui/material';
import { useToggle } from 'react-use';
import { OpsLogFlowDocument } from 'types';
import { FormattedMessage, useIntl } from 'react-intl';
import LevelCell from '../cells/logs/LevelCell';
import TimestampCell from '../cells/logs/TimestampCell';
import MessageCell from '../cells/logs/MessageCell';
import FieldsExpandedCell from '../cells/logs/FieldsExpandedCell';
import LevelIcon from '../cells/logs/LevelIcon';

interface RowProps {
    row: OpsLogFlowDocument;
}

interface RowsProps {
    data: OpsLogFlowDocument[];
    loading?: boolean;
    hitFileStart?: boolean;
}

function Row({ row }: RowProps) {
    const hasFields = Boolean(row.fields);
    const [expanded, toggleExpanded] = useToggle(false);

    return (
        <>
            <TableRow
                hover={hasFields}
                aria-expanded={hasFields ? expanded : undefined}
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
            {hasFields ? (
                <FieldsExpandedCell expanded={expanded} fields={row.fields} />
            ) : null}
        </>
    );
}

function Rows({ data, loading, hitFileStart }: RowsProps) {
    const intl = useIntl();

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

                    <TimestampCell ts="-" />

                    <MessageCell
                        message={intl.formatMessage({
                            id: 'ops.logsTable.allOldLogsLoaded',
                        })}
                    />
                </TableRow>
            ) : null}
            {data.map((record) => (
                <Row row={record} key={record._meta.uuid} />
            ))}
        </>
    );
}

export default Rows;
