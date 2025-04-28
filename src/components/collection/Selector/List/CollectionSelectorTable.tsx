import { Box, Table, useTheme } from '@mui/material';

import { useScrollbarWidth } from 'react-use';

import {
    COLLECTION_SELECTOR_NAME_COL,
    COLLECTION_SELECTOR_REMOVE,
    COLLECTION_SELECTOR_TOGGLE_COL,
    DEFAULT_ROW_HEIGHT,
    ENABLE_SCROLL_GAP,
    ENABLE_SELECTION,
} from 'src/components/collection/Selector/List/shared';
import {
    TABLE_BODY_CELL_CLASS_PREFIX,
    TABLE_HEADER_CELL_CLASS_PREFIX,
} from 'src/components/tables/EntityTable/shared';
import { defaultOutline, truncateTextSx } from 'src/context/Theme';

function CollectionSelectorTable({ children, selectionEnabled }: any) {
    const theme = useTheme();
    const scrollGap = useScrollbarWidth();

    return (
        <Table
            component={Box}
            stickyHeader
            sx={{
                height: '100%',
                overflow: 'hidden',
                [`& .MuiTableBody-root .MuiTableCell-root,
                        & .MuiTableHead-root .MuiTableCell-root`]: {
                    display: 'flex',
                    height: DEFAULT_ROW_HEIGHT,
                    padding: 0,
                },
                [`& .MuiTableRow-root`]: {
                    display: 'flex',
                },
                // TODO (theme - kinda) Probably just move this chunk into the theme file. Also, we probably want to
                //  look into doing more styling based on the parent.
                // We do a lot of rendering down below - need to keep styling as fast as possible
                //  so just putting this on the wrapper
                [`.${ENABLE_SELECTION} & .MuiTableCell-body`]: {
                    cursor: 'pointer',
                },
                [`.${ENABLE_SCROLL_GAP} & .MuiTableHead-root .MuiTableRow-root:last-of-type,
                 .${ENABLE_SCROLL_GAP} & .MuiTableFooter-root .MuiTableRow-root:last-of-type`]:
                    {
                        pr: `${scrollGap}px`,
                    },

                // This allows us to add the scroll gap in and still have a border over/under the scrollbar
                [`& .MuiTableHead-root .MuiTableRow-root`]: {
                    borderBottom: defaultOutline[theme.palette.mode],
                    [`& .MuiTableCell-root`]: {
                        borderBottom: 'none',
                    },
                },
                [`& .MuiTableFooter-root .MuiTableRow-root`]: {
                    borderTop: defaultOutline[theme.palette.mode],
                    [`& .MuiTableCell-root`]: {
                        borderTop: 'none',
                    },
                },

                // Control column width without having to hardcode on each row
                [`& .MuiTableHead-root .${TABLE_HEADER_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_TOGGLE_COL},
                            & .MuiTableBody-root .${TABLE_BODY_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_TOGGLE_COL}`]:
                    {
                        minWidth: 90,
                        width: 90,
                    },
                [`& .MuiTableHead-root .${TABLE_HEADER_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_NAME_COL},
                            & .MuiTableBody-root .${TABLE_BODY_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_NAME_COL}`]:
                    {
                        ...(truncateTextSx as any),
                        flexGrow: 1,
                    },
                [`& .MuiTableHead-root .${TABLE_HEADER_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_NAME_COL}`]:
                    {
                        px: 1,
                    },
                [`& .MuiTableHead-root .${TABLE_HEADER_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_REMOVE},
                            & .MuiTableBody-root .${TABLE_BODY_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_REMOVE}`]:
                    {
                        minWidth: 52,
                        width: 52,
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
            }}
        >
            {children}
        </Table>
    );
}

export default CollectionSelectorTable;
