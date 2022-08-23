import { TableRow, useTheme } from '@mui/material';
import { LiveSpecsExtQuery } from 'components/tables/Captures';
import Actions from 'components/tables/cells/Actions';
import EntityName from 'components/tables/cells/EntityName';
import ExpandDetails from 'components/tables/cells/ExpandDetails';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';
import DetailsPanel from 'components/tables/Details/DetailsPanel';
import PreviewPanel from 'components/tables/Details/PreviewPanel';
import { getEntityTableRowSx } from 'context/Theme';
import { useState } from 'react';
import { ENTITY } from 'types';

interface RowProps {
    row: LiveSpecsExtQuery;
    showEntityStatus: boolean;
}

interface RowsProps {
    data: LiveSpecsExtQuery[];
    showEntityStatus: boolean;
}

export const tableColumns = [
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastPublished',
    },
    {
        field: 'last_pub_user_full_name',
        headerIntlKey: 'entityTable.data.lastPubUserFullName',
    },
    {
        field: null,
        headerIntlKey: null,
    },
];

function Row({ row, showEntityStatus }: RowProps) {
    const theme = useTheme();

    const [detailsExpanded, setDetailsExpanded] = useState(false);
    const [previewExpanded, setPreviewExpanded] = useState(false);

    return (
        <>
            <TableRow
                key={`Entity-${row.id}`}
                sx={getEntityTableRowSx(theme, detailsExpanded)}
            >
                <EntityName
                    name={row.catalog_name}
                    showEntityStatus={showEntityStatus}
                />

                <TimeStamp time={row.updated_at} />

                <UserName
                    avatar={row.last_pub_user_avatar_url}
                    email={row.last_pub_user_email}
                    name={row.last_pub_user_full_name}
                />

                <Actions>
                    <ExpandDetails
                        onClick={() => {
                            setDetailsExpanded(!detailsExpanded);
                            if (!detailsExpanded) {
                                setPreviewExpanded(false);
                            }
                        }}
                        expanded={detailsExpanded}
                    />
                    <ExpandDetails
                        onClick={() => {
                            setPreviewExpanded(!previewExpanded);
                            if (!previewExpanded) {
                                setDetailsExpanded(false);
                            }
                        }}
                        expanded={previewExpanded}
                        messageId="cta.preview"
                    />
                </Actions>
            </TableRow>

            <DetailsPanel
                detailsExpanded={detailsExpanded}
                lastPubId={row.last_pub_id}
                colSpan={tableColumns.length}
                entityType={ENTITY.COLLECTION}
                entityName={row.catalog_name}
                disableLogs
            />
            <PreviewPanel
                expanded={previewExpanded}
                colSpan={tableColumns.length}
                collectionName={row.catalog_name}
            />
        </>
    );
}

function Rows({ data, showEntityStatus }: RowsProps) {
    return (
        <>
            {data.map((row) => (
                <Row
                    row={row}
                    showEntityStatus={showEntityStatus}
                    key={row.id}
                />
            ))}
        </>
    );
}

export default Rows;
