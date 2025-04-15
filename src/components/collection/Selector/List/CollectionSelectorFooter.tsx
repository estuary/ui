import type { CollectionSelectorFooterProps } from 'src/components/collection/Selector/List/types';

import { Box, TableCell, TableFooter, TableRow } from '@mui/material';

import { useIntl } from 'react-intl';

function CollectionSelectorFooter({
    columnCount,
    filteredCount,
    totalCount,
}: CollectionSelectorFooterProps) {
    const intl = useIntl();

    return (
        <TableFooter component="div">
            <TableRow component="div" sx={{}}>
                <TableCell component="div" sx={{ flex: 1, p: 0.25 }}>
                    <Box>
                        {intl.formatMessage(
                            {
                                id: filteredCount
                                    ? 'workflows.collectionSelector.footer.filteredCount'
                                    : 'workflows.collectionSelector.footer.count',
                            },
                            {
                                filteredCount,
                                totalCount,
                            }
                        )}
                    </Box>
                </TableCell>
            </TableRow>
        </TableFooter>
    );
}

export default CollectionSelectorFooter;
