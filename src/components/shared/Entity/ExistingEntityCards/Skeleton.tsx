import { Box, Skeleton } from '@mui/material';
import {
    connectorImageBackgroundRadius,
    semiTransparentBackground,
} from 'context/Theme';

interface Props {
    opacity?: string;
}

const boxShadow =
    'rgb(50 50 93 / 7%) 0px 3px 6px -1px, rgb(0 0 0 / 10%) 0px -2px 4px -1px, rgb(0 0 0 / 10%) 0px 2px 4px -1px';

function ExistingEntityCardSkeleton({ opacity }: Props) {
    return (
        <Box
            sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                background: (theme) =>
                    semiTransparentBackground[theme.palette.mode],
                boxShadow,
                borderRadius: 3,
                opacity,
            }}
        >
            <Skeleton
                variant="rounded"
                width={51}
                height={50}
                sx={{ borderRadius: connectorImageBackgroundRadius }}
            />

            <Box sx={{ ml: 2 }}>
                <Skeleton
                    variant="rectangular"
                    width={250}
                    height={16}
                    sx={{ mb: 1 }}
                />

                <Skeleton variant="rectangular" width={180} height={8} />
            </Box>
        </Box>
    );
}

export default ExistingEntityCardSkeleton;
