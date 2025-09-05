import type { StatusSectionProps } from 'src/components/shared/Entity/Details/Overview/DetailsSection/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { useEditorStore_currentCatalog } from 'src/components/editor/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';
import { useEntityStatusStore_singleResponse } from 'src/stores/EntityStatus/hooks';
import { taskIsDisabled } from 'src/utils/spec-utils';

function StatusSection({ entityName }: StatusSectionProps) {
    const latestConnectorStatus =
        useEntityStatusStore_singleResponse(entityName)?.connector_status
            ?.message;

    const intl = useIntl();

    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });

    if (taskIsDisabled(currentCatalog?.spec)) {
        return (
            <AlertBox
                // title={intl.formatMessage({
                //     id: 'detailsPanel.status.taskDisabled.title',
                // })}
                severity="warning"
                short
                sx={{ maxWidth: 'fit-content' }}
            >
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
