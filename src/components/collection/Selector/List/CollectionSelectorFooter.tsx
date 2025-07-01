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

import { DEFAULT_ROW_HEIGHT } from 'src/components/collection/Selector/List/shared';
import { defaultOutlineColor } from 'src/context/Theme';
import { useBackfillCountMessage } from 'src/hooks/bindings/useBackfillCountMessage';
import { useBinding_enabledBindings_count } from 'src/stores/Binding/hooks';

function CollectionSelectorFooter({
    columnCount,
    totalCount,
}: CollectionSelectorFooterProps) {
    const intl = useIntl();

    const enabledBindingsCount = useBinding_enabledBindings_count();

    const { calculatedCount } = useBackfillCountMessage();

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
                                {intl.formatMessage(
                                    {
                                        id: Boolean(enabledBindingsCount)
                                            ? enabledBindingsCount ===
                                              totalCount
                                                ? 'workflows.collectionSelector.footer.enabledCount.all'
                                                : 'workflows.collectionSelector.footer.enabledCount'
                                            : 'workflows.collectionSelector.footer.enabledCount.empty',
                                    },
                                    {
                                        disabledBindingsCount:
                                            enabledBindingsCount,
                                    }
                                )}
                            </Box>
                            <Box>
                                {intl.formatMessage(
                                    {
                                        id: Boolean(calculatedCount)
                                            ? calculatedCount === totalCount
                                                ? 'workflows.collectionSelector.footer.backfilled.all'
                                                : 'workflows.collectionSelector.footer.backfilled'
                                            : 'workflows.collectionSelector.footer.backfilled.empty',
                                    },
                                    {
                                        calculatedCount,
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
                    ) : null}
                </TableCell>
            </TableRow>
        </TableFooter>
    );
}

export default CollectionSelectorFooter;
