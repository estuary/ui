import FilterListIcon from '@mui/icons-material/FilterList';

import { alpha } from '@mui/material/styles';

import { IconButton, Toolbar, Tooltip, Typography } from '@mui/material';

interface EnhancedTableToolbarProps {
    header: string;
    numSelected: number;
}

function SortableTableToolbar(props: EnhancedTableToolbarProps) {
    const { header, numSelected } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(
                            theme.palette.primary.main,
                            theme.palette.action.activatedOpacity
                        ),
                }),
            }}
        >
            <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h6"
                id="tableTitle"
                component="div"
            >
                {header}
            </Typography>
            {numSelected > 0 && (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            )}

            <Tooltip title="Filter list">
                <IconButton>
                    <FilterListIcon />
                </IconButton>
            </Tooltip>
        </Toolbar>
    );
}

export default SortableTableToolbar;
