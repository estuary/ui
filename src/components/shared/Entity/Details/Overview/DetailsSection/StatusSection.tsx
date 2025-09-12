import type { StatusSectionProps } from 'src/components/shared/Entity/Details/Overview/DetailsSection/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityStatusStore_singleResponse } from 'src/stores/EntityStatus/hooks';

function StatusSection({ entityName }: StatusSectionProps) {
    const statusSingleResponse =
        useEntityStatusStore_singleResponse(entityName);

    const latestConnectorStatus =
        statusSingleResponse?.connector_status?.message;

    const disabled = Boolean(statusSingleResponse?.disabled);

    const intl = useIntl();

    if (disabled) {
        return (
            <AlertBox severity="warning" short sx={{ maxWidth: 'fit-content' }}>
                {intl.formatMessage({
                    id: 'detailsPanel.status.taskDisabled.message',
                })}
            </AlertBox>
        );
    }

    return (
        <Typography component="div">{latestConnectorStatus ?? '-'}</Typography>
    );
}

export default StatusSection;
