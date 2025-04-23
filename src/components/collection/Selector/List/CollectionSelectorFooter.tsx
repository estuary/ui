import type { CollectionSelectorFooterProps } from 'src/components/collection/Selector/types';

import {
    Box,
    Divider,
    Stack,
    TableCell,
    TableFooter,
    TableRow,
} from '@mui/material';

import { useIntl } from 'react-intl';

import { defaultOutlineColor } from 'src/context/Theme';
import { useBinding_disabledBindings_count } from 'src/stores/Binding/hooks';

function CollectionSelectorFooter({
    columnCount,
    totalCount,
}: CollectionSelectorFooterProps) {
    const intl = useIntl();

    const disabledBindingsCount = useBinding_disabledBindings_count();

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
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', justifyContent: 'end' }}
                        divider={<Divider orientation="vertical" flexItem />}
                    >
                        <Box>
                            {intl.formatMessage(
                                {
                                    id: Boolean(disabledBindingsCount)
                                        ? disabledBindingsCount === totalCount
                                            ? 'workflows.collectionSelector.footer.disabledCount.all'
                                            : 'workflows.collectionSelector.footer.disabledCount'
                                        : 'workflows.collectionSelector.footer.disabledCount.empty',
                                },
                                {
                                    disabledBindingsCount,
                                }
                            )}
                        </Box>
                        <Box>
                            {intl.formatMessage(
                                {
                                    id: Boolean(totalCount)
                                        ? 'workflows.collectionSelector.footer.count'
                                        : 'workflows.collectionSelector.footer.count.empty',
                                },
                                {
                                    totalCount,
                                }
                            )}
                        </Box>
                    </Stack>
                </TableCell>
            </TableRow>
        </TableFooter>
    );
}

export default CollectionSelectorFooter;
