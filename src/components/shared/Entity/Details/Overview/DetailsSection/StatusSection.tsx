import { Typography } from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityStatusStore_singleResponse } from 'src/stores/EntityStatus/hooks';

interface StatusSectionProps {
    entityName: string;
}

export function StatusSection({ entityName }: StatusSectionProps) {
    const statusSingleResponse =
        useEntityStatusStore_singleResponse(entityName);

    const latestConnectorStatus =
        statusSingleResponse?.connector_status?.message;

    const disabled = Boolean(statusSingleResponse?.disabled);

    if (disabled) {
        return (
            <AlertBox severity="warning" short sx={{ maxWidth: 'fit-content' }}>
                Task is disabled
            </AlertBox>
        );
    }

    return (
        <Typography component="div">{latestConnectorStatus ?? '-'}</Typography>
    );
}
