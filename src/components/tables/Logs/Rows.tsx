import { TableRow } from '@mui/material';
import { useToggle } from 'react-use';
import { OpsLogFlowDocument } from 'types';
import LevelCell from '../cells/logs/LevelCell';
import TimestampCell from '../cells/logs/TimestampCell';
import MessageCell from '../cells/logs/MessageCell';
import FieldsExpandedCell from '../cells/logs/FieldsExpandedCell';

interface RowProps {
    row: OpsLogFlowDocument;
}

interface RowsProps {
    data: OpsLogFlowDocument[];
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

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((record) => (
                <Row row={record} key={record._meta.uuid} />
            ))}
        </>
    );
}

export default Rows;
