import { Toolbar, Typography } from '@mui/material';

interface EnhancedTableToolbarProps {
    toolbarID: string;
    header: string;
}

function SortableTableToolbar(props: EnhancedTableToolbarProps) {
    const { header, toolbarID } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >
            <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h6"
                id={toolbarID}
                component="div"
            >
                {header}
            </Typography>
        </Toolbar>
    );
}

export default SortableTableToolbar;
