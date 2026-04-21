import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';

interface Props {
    allBindings?: boolean;
}

export default function BackfillDescription({ allBindings }: Props) {
    const intl = useIntl();
    const entityType = useEntityType();

    const suffix = allBindings ? '.allBindings' : '';

    return (
        <Stack spacing={2}>
            <Typography>
                {intl.formatMessage({
                    id: `workflows.collectionSelector.manualBackfill.message.${entityType}${suffix}`,
                })}
            </Typography>

            {entityType === 'materialization' ? (
                <AlertBox severity="warning" short>
                    {intl.formatMessage({
                        id: `workflows.collectionSelector.manualBackfill.message.materialization.allBindings.warning`,
                    })}
                </AlertBox>
            ) : null}
        </Stack>
    );
}
