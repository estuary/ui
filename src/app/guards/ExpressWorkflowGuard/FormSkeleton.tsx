import { CircularProgress, Grid, Skeleton } from '@mui/material';

export const FormSkeleton = () => {
    return (
        <Grid container columns={{ xs: 4, md: 12 }} spacing={{ xs: 2 }}>
            <Grid
                size={{ xs: 12 }}
                style={{ display: 'flex', justifyContent: 'space-between' }}
            >
                <Skeleton
                    style={{
                        flexGrow: 1,
                        height: 32,
                        marginRight: 48,
                        maxWidth: 250,
                    }}
                />

                <Skeleton style={{ flexGrow: 1, height: 37, maxWidth: 66 }} />
            </Grid>

            <Grid
                size={{ xs: 12 }}
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    height: 450,
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Grid>
        </Grid>
    );
};
