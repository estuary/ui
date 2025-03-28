import { Box, Grid, Skeleton } from '@mui/material';

import Tile from 'src/components/connectors/Tile';

const tileCount = 6;

function ConnectorsSkeleton() {
    return (
        <>
            {Array(tileCount)
                .fill(
                    <Tile>
                        <Box>
                            <Skeleton
                                variant="rectangular"
                                height={125}
                                sx={{ mb: 2, borderRadius: 3 }}
                            />

                            <Skeleton />

                            <Skeleton />

                            <Skeleton sx={{ mb: 5 }} />
                        </Box>
                    </Tile>
                )
                .map((skeleton, index) => (
                    <Grid
                        key={`connector-skeleton-${index}`}
                        item
                        xs={2}
                        md={4}
                        lg={2}
                        xl={2}
                        sx={{ maxWidth: 275 }}
                    >
                        {skeleton}
                    </Grid>
                ))}
        </>
    );
}

export default ConnectorsSkeleton;
