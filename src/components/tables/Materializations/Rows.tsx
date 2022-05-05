import { Box, Button, TableCell, TableRow } from '@mui/material';
import ChipList from 'components/tables/cells/ChipList';
import EntityName from 'components/tables/cells/EntityName';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { LiveSpecsQuery } from 'components/tables/Materializations';
import { FormattedMessage } from 'react-intl';

interface Props {
    data: LiveSpecsQuery[];
}

export const tableColumns = [
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: 'reads_from',
        headerIntlKey: 'entityTable.data.readsFrom',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.actions',
    },
];

function Rows({ data }: Props) {
    return (
        <>
            {data.map((row) => (
                <TableRow key={`Entity-${row.id}`}>
                    <EntityName name={row.catalog_name} />

                    <ChipList strings={row.reads_from} />

                    <TimeStamp time={row.updated_at} />

                    <TableCell>
                        <Box
                            sx={{
                                display: 'flex',
                            }}
                        >
                            <Button
                                variant="contained"
                                size="small"
                                disableElevation
                                sx={{ mr: 1 }}
                                disabled
                            >
                                <FormattedMessage id="cta.details" />
                            </Button>
                        </Box>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}

export default Rows;
