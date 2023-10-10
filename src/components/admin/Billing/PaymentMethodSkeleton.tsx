import { Skeleton, Stack } from '@mui/material';

function PaymentMethodSkeleton() {
    return (
        <Stack>
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Stack direction="row">
                <Skeleton />
                <Skeleton />
            </Stack>
        </Stack>
    );
}

export default PaymentMethodSkeleton;
