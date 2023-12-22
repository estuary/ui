import { Box, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import ListAndDetails from 'components/editor/ListAndDetails';
import { defaultOutline, semiTransparentBackground } from 'context/Theme';

function ListViewSkeleton() {
    const theme = useTheme();

    return (
        <Grid item xs={12}>
            <ListAndDetails
                backgroundColor={semiTransparentBackground[theme.palette.mode]}
                details={<Skeleton variant="rectangular" sx={{ mb: 1 }} />}
                displayBorder
                list={
                    <Box>
                        <Box
                            sx={{
                                height: 40,
                                px: 1,
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom:
                                    defaultOutline[theme.palette.mode],
                            }}
                        >
                            <Typography>Key</Typography>
                        </Box>

                        <Box
                            sx={{
                                height: 52,
                                px: 1,
                                py: 2,
                                borderBottom:
                                    defaultOutline[theme.palette.mode],
                            }}
                        >
                            <Skeleton variant="rectangular" />
                        </Box>

                        <Box
                            sx={{
                                height: 52,
                                px: 1,
                                py: 2,
                                borderBottom:
                                    defaultOutline[theme.palette.mode],
                            }}
                        >
                            <Skeleton variant="rectangular" />
                        </Box>

                        <Box
                            sx={{
                                height: 52,
                                px: 1,
                                py: 2,
                                borderBottom:
                                    defaultOutline[theme.palette.mode],
                            }}
                        >
                            <Skeleton variant="rectangular" />
                        </Box>
                    </Box>
                }
            />
        </Grid>
    );
}

export default ListViewSkeleton;
