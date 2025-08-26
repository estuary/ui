import type { ConnectorSkeletonProps } from 'src/components/connectors/Grid/types';

import { Box, Grid, Skeleton, Stack } from '@mui/material';

import Tile from 'src/components/connectors/Grid/Tile';

const tileCount = 6;

function ConnectorSkeleton({ condensed }: ConnectorSkeletonProps) {
    return (
        <>
            {Array(tileCount)
                .fill(
                    <Tile>
                        {condensed ? (
                            <Stack direction="row" spacing={1}>
                                <Skeleton
                                    variant="rectangular"
                                    height={50}
                                    sx={{ mb: 2, borderRadius: 3 }}
                                    width={50}
                                />

                                <Stack style={{ flexGrow: 1 }}>
                                    <Skeleton
                                        style={{ height: 27, width: 125 }}
                                    />

                                    <Skeleton
                                        style={{ height: 24, width: 75 }}
                                    />
                                </Stack>
                            </Stack>
                        ) : (
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
                        )}
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

export default ConnectorSkeleton;
