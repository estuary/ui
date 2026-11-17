import type { CollectionSelectorFooterProps } from 'src/components/collection/Selector/types';

import {
    Box,
    Divider,
    Stack,
    TableCell,
    TableFooter,
    TableRow,
} from '@mui/material';

import { DEFAULT_ROW_HEIGHT } from 'src/components/collection/Selector/List/shared';
import { defaultOutlineColor } from 'src/context/Theme';
import { useBackfillCountMessage } from 'src/hooks/bindings/useBackfillCountMessage';
import { useBinding_enabledBindings_count } from 'src/stores/Binding/hooks';

function CollectionSelectorFooter({
    totalCount,
}: CollectionSelectorFooterProps) {
    const enabledBindingsCount = useBinding_enabledBindings_count();
    const { backfillCount } = useBackfillCountMessage();

    // TODO (FireFox Height Hack) - hardcoded height to make life easier
    return (
        <TableFooter component="div" sx={{ height: DEFAULT_ROW_HEIGHT }}>
            <TableRow component="div" sx={{ height: DEFAULT_ROW_HEIGHT }}>
                <TableCell
                    component="div"
                    align="right"
                    sx={{
                        alignContents: 'center',
                        borderBottom: 'none',
                        borderTop: (theme) =>
                            `1px solid ${defaultOutlineColor[theme.palette.mode]}`,
                        flex: 1,
                        px: 1,
                        py: 0.7,
                    }}
                >
                    {totalCount > 0 ? (
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center', justifyContent: 'end' }}
                            divider={
                                <Divider orientation="vertical" flexItem />
                            }
                        >
                            <Box>
                                {Boolean(enabledBindingsCount)
                                    ? enabledBindingsCount === totalCount
                                        ? 'all enabled'
                                        : `enabled: ${enabledBindingsCount}`
                                    : 'all disabled'}
                            </Box>

                            <Box>
                                {Boolean(backfillCount)
                                    ? backfillCount === totalCount
                                        ? 'all backfilled'
                                        : `backfilled: ${backfillCount}`
                                    : '-'}
                            </Box>
                            <Box>
                                {Boolean(totalCount)
                                    ? `total: ${totalCount}`
                                    : ' '}
                            </Box>
                        </Stack>
                    ) : null}
                </TableCell>
            </TableRow>
        </TableFooter>
    );
}

export default CollectionSelectorFooter;
