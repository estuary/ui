import { Box, Divider, Skeleton, Stack } from '@mui/material';

FormLoading.propTypes = {};
function FormLoading() {
    return (
        <Box>
            <Stack spacing={3}>
                <Stack spacing={1}>
                    <Skeleton variant="rectangular" width={120} height={10} />
                    <Skeleton variant="rectangular" height={20} />
                    <Divider />
                    <Skeleton variant="rectangular" width={310} height={5} />
                </Stack>

                <Stack spacing={1}>
                    <Skeleton variant="rectangular" width={50} height={10} />
                    <Skeleton variant="rectangular" height={20} />
                    <Divider />
                    <Skeleton variant="rectangular" width={250} height={15} />
                </Stack>

                <Skeleton variant="rectangular" width={20} height={20} />
            </Stack>
        </Box>
    );
}

export default FormLoading;
