import Grid from '@mui/material/Grid';

export const GridWrapper = ({ children }: { children: any }) => {
    return (
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2 }}>
            {children}
        </Grid>
    );
};
