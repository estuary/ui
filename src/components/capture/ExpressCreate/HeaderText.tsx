import { Typography } from '@mui/material';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useWorkflowStore_connectorMetadataProperty } from 'src/stores/Workflow/hooks';

export const ExpressHeaderText = () => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    // todo (gql:connector) - need to update this
    const connectorTitle = useWorkflowStore_connectorMetadataProperty(
        connectorId,
        'title'
    );

    return <Typography variant="h6">{connectorTitle}</Typography>;
};
