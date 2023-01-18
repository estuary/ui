import { Stack, Typography } from '@mui/material';
import FullPageSpinner from 'components/fullPage/Spinner';
import { LiveSpecsExtQueryWithSpec } from 'hooks/useLiveSpecsExt';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    liveSpecs: LiveSpecsExtQueryWithSpec[];
    checkingEntityExistence: boolean;
}

function EntityExistenceGuard({
    liveSpecs,
    checkingEntityExistence,
    children,
}: Props) {
    if (checkingEntityExistence) {
        return <FullPageSpinner />;
    } else if (liveSpecs.length === 0) {
        return (
            <Stack spacing={2} sx={{ alignItems: 'center' }}>
                <Typography variant="h5">Entity not found</Typography>

                <Typography>
                    The entity you are looking for could not be found. This is
                    likely because it has been deleted.
                </Typography>
            </Stack>
        );
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default EntityExistenceGuard;
