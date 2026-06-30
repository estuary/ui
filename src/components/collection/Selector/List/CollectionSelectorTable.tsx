import {
    Box,
    Table,
    tableBodyClasses,
    tableCellClasses,
    tableFooterClasses,
    tableHeadClasses,
    tableRowClasses,
    useTheme,
} from '@mui/material';

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
                [`& .${tableBodyClasses.root} .${tableCellClasses.root},
                        & .${tableHeadClasses.root} .${tableCellClasses.root}`]:
                    {
                        display: 'flex',
                        height: DEFAULT_ROW_HEIGHT,
                        padding: 0,
                    },
                [`& .${tableRowClasses.root}`]: {
                    display: 'flex',
                },
                // TODO (theme - kinda) Probably just move this chunk into the theme file. Also, we probably want to
                //  look into doing more styling based on the parent.
                // We do a lot of rendering down below - need to keep styling as fast as possible
                //  so just putting this on the wrapper
                [`.${ENABLE_SELECTION} & .${tableCellClasses.body}`]: {
                    cursor: 'pointer',
                },
                [`.${ENABLE_SCROLL_GAP} & .${tableHeadClasses.root} .${tableRowClasses.root}:last-of-type,
                 .${ENABLE_SCROLL_GAP} & .${tableFooterClasses.root} .${tableRowClasses.root}:last-of-type`]:
                    {
                        pr: `${scrollGap}px`,
                    },

                // This allows us to add the scroll gap in and still have a border over/under the scrollbar
                [`& .${tableHeadClasses.root} .${tableRowClasses.root}`]: {
                    borderBottom: defaultOutline[theme.palette.mode],
                    [`& .${tableCellClasses.root}`]: {
                        borderBottom: 'none',
                    },
                },
                [`& .${tableFooterClasses.root} .${tableRowClasses.root}`]: {
                    borderTop: defaultOutline[theme.palette.mode],
                    [`& .${tableCellClasses.root}`]: {
                        borderTop: 'none',
                    },
                },

                // Control column width without having to hardcode on each row
                [`& .${tableHeadClasses.root} .${TABLE_HEADER_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_TOGGLE_COL},
                            & .${tableBodyClasses.root} .${TABLE_BODY_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_TOGGLE_COL}`]:
                    {
                        minWidth: 90,
                        width: 90,
                    },
                [`& .${tableHeadClasses.root} .${TABLE_HEADER_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_NAME_COL},
                            & .${tableBodyClasses.root} .${TABLE_BODY_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_NAME_COL}`]:
                    {
                        ...(truncateTextSx as any),
                        flexGrow: 1,
                    },
                [`& .${tableHeadClasses.root} .${TABLE_HEADER_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_NAME_COL}`]:
                    {
                        px: 1,
                    },
                [`& .${tableHeadClasses.root} .${TABLE_HEADER_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_REMOVE},
                            & .${tableBodyClasses.root} .${TABLE_BODY_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_REMOVE}`]:
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
