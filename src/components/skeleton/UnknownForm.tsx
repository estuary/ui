import { Skeleton, Stack } from '@mui/material';

const ITEM_HEIGHT = 20;

// used for anything where we are not really sure what the form will look like
//  ex: EndpointConfig or ResourceConfig
function UnknownFormSkeleton() {
    return (
        <Stack spacing={2}>
            <Skeleton variant="rectangular" height={ITEM_HEIGHT} />

            <Skeleton
                variant="rectangular"
                height={ITEM_HEIGHT}
                style={{ opacity: '66%' }}
            />

            <Skeleton
                variant="rectangular"
                height={ITEM_HEIGHT}
                style={{ opacity: '33%' }}
            />
        </Stack>
    );
}

export default UnknownFormSkeleton;
