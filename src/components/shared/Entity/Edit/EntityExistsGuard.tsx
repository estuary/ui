import { Stack, Typography } from '@mui/material';
import FullPageSpinner from 'components/fullPage/Spinner';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useLiveSpecsExtWithSpec } from 'hooks/useLiveSpecsExt';
import { BaseComponentProps } from 'types';

function EntityExistsGuard({ children }: BaseComponentProps) {
    const liveSpecId = useGlobalSearchParams(GlobalSearchParams.LIVE_SPEC_ID);

    const entityType = useEntityType();

    const { liveSpecs, isValidating: checkingExistence } =
        useLiveSpecsExtWithSpec(liveSpecId, entityType);

    if (checkingExistence) {
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

export default EntityExistsGuard;
