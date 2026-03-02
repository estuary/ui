import type { DataPlaneNode } from 'src/api/gql/dataPlanes';

import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { Star, StarSolid, Xmark } from 'iconoir-react';

import { toPresentableName } from 'src/utils/dataPlane-utils';

function DataPlaneRow({
    dataPlane,
    isDefault,
    handleSetDefault,
    handleRemove,
}: {
    dataPlane: DataPlaneNode;
    isDefault?: boolean;
    handleSetDefault?: () => void;
    handleRemove: () => void;
}) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Box
                sx={{
                    'display': 'flex',
                    'justifyContent': 'space-between',
                    'alignItems': 'center',
                    'flex': 1,
                    'px': 1.5,
                    'py': 1,
                    'borderRadius': 1,
                    'bgcolor': 'background.default',
                    '&:hover .star-outline': {
                        opacity: 1,
                    },
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">
                        {toPresentableName(dataPlane)}
                    </Typography>
                    {isDefault ? (
                        <>
                            <StarSolid width={16} height={16} color="#f5c518" />{' '}
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Default
                            </Typography>
                        </>
                    ) : (
                        <Tooltip title="Set as default" enterDelay={500}>
                            <Box
                                component="span"
                                className="star-outline"
                                onClick={handleSetDefault}
                                sx={{
                                    'opacity': 0,
                                    'transition': 'opacity 0.15s',
                                    'cursor': 'pointer',
                                    'display': 'inline-flex',
                                    'alignItems': 'center',
                                    '& svg': {
                                        transition: 'fill 0.15s',
                                    },
                                    '&:hover svg': {
                                        fill: 'rgba(245, 197, 24, 0.2)',
                                    },
                                }}
                            >
                                <Star width={16} height={16} color="#9e9e9e" />
                            </Box>
                        </Tooltip>
                    )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                    {dataPlane.cloudProvider} &middot; {dataPlane.region}{' '}
                    &middot; {dataPlane.scope}
                </Typography>
            </Box>

            <IconButton size="small" onClick={handleRemove}>
                <Xmark width={16} height={16} />
            </IconButton>
        </Stack>
    );
}

export default DataPlaneRow;
