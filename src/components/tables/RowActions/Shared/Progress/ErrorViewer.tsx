import type { ErrorViewerProps } from 'src/components/tables/RowActions/Shared/types';

import { Box } from '@mui/material';

import Error from 'src/components/shared/Error';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';

const wrapperStyling = { mb: 1, ml: 3, width: '100%' };

function ErrorViewer({ error, renderError, state }: ErrorViewerProps) {
    const skipped = state === ProgressStates.SKIPPED;

    return (
        <Box sx={wrapperStyling}>
            renderError ? ( renderError(error, state) ) : (
            <Error error={error} hideTitle condensed noAlertBox={skipped} />)
        </Box>
    );
}

export default ErrorViewer;
