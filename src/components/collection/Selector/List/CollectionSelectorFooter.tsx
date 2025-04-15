import type { CollectionSelectorFooterProps } from 'src/components/collection/Selector/types';

import { TableCell, TableFooter, TableRow } from '@mui/material';

import { useIntl } from 'react-intl';

import { defaultOutlineColor } from 'src/context/Theme';

function CollectionSelectorFooter({
    columnCount,
    filteredCount,
    totalCount,
}: CollectionSelectorFooterProps) {
    const intl = useIntl();

    return (
        <TableFooter component="div">
            <TableRow component="div">
                <TableCell
                    component="div"
                    align="right"
                    sx={{
                        borderBottom: 'none',
                        borderTop: (theme) =>
                            `1px solid ${defaultOutlineColor[theme.palette.mode]}`,
                        flex: 1,
                        px: 1,
                        py: 0.7,
                    }}
                >
                    {intl.formatMessage(
                        {
                            id:
                                filteredCount === 0
                                    ? 'workflows.collectionSelector.footer.filteredCountEmpty'
                                    : Boolean(filteredCount)
                                      ? 'workflows.collectionSelector.footer.filteredCount'
                                      : 'workflows.collectionSelector.footer.count',
                        },
                        {
                            filteredCount,
                            totalCount,
                        }
                    )}
                </TableCell>
            </TableRow>
        </TableFooter>
    );
}

export default CollectionSelectorFooter;
