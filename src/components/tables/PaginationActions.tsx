import { Box, IconButton, useTheme } from '@mui/material';
import {
    FastArrowLeft,
    FastArrowRight,
    NavArrowLeft,
    NavArrowRight,
} from 'iconoir-react';

interface TablePaginationActionsProps {
    count: number;
    onPageChange: (
        event: React.MouseEvent<HTMLButtonElement>,
        newPage: number
    ) => void;
    page: number;
    rowsPerPage: number;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handlers = {
        firstPageButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => {
            onPageChange(event, 0);
        },
        backButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => {
            onPageChange(event, page - 1);
        },
        nextButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => {
            onPageChange(event, page + 1);
        },
        lastPageButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => {
            onPageChange(
                event,
                Math.max(0, Math.ceil(count / rowsPerPage) - 1)
            );
        },
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handlers.firstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
                sx={{ color: theme.palette.text.primary }}
            >
                {theme.direction === 'rtl' ? (
                    <FastArrowRight />
                ) : (
                    <FastArrowLeft />
                )}
            </IconButton>

            <IconButton
                onClick={handlers.backButtonClick}
                disabled={page === 0}
                aria-label="previous page"
                sx={{ color: theme.palette.text.primary }}
            >
                {theme.direction === 'rtl' ? (
                    <NavArrowRight />
                ) : (
                    <NavArrowLeft />
                )}
            </IconButton>

            <IconButton
                onClick={handlers.nextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
                sx={{ color: theme.palette.text.primary }}
            >
                {theme.direction === 'rtl' ? (
                    <NavArrowLeft />
                ) : (
                    <NavArrowRight />
                )}
            </IconButton>

            <IconButton
                onClick={handlers.lastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
                sx={{ color: theme.palette.text.primary }}
            >
                {theme.direction === 'rtl' ? (
                    <FastArrowLeft />
                ) : (
                    <FastArrowRight />
                )}
            </IconButton>
        </Box>
    );
}

export default TablePaginationActions;
