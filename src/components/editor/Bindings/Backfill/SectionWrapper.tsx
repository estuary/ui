import { Box, Stack, Typography } from '@mui/material';
import TrialOnlyPrefixAlert from 'components/materialization/TrialOnlyPrefixAlert';
import { useEntityType } from 'context/EntityContext';
import { useIntl } from 'react-intl';
import { SectionWrapperProps } from './types';

export default function SectionWrapper({
    alertMessageId,
    bindingUUID,
    children,
}: SectionWrapperProps) {
    const intl = useIntl();

    const entityType = useEntityType();

    return (
        <Box sx={{ mb: 4, mt: 3 }}>
            <Stack spacing={1}>
                <Typography component="div" variant="formSectionHeader">
                    {intl.formatMessage({
                        id: 'workflows.collectionSelector.manualBackfill.header',
                    })}
                </Typography>

                {entityType === 'materialization' ? (
                    <TrialOnlyPrefixAlert
                        bindingUUID={bindingUUID}
                        messageId={alertMessageId}
                    />
                ) : null}

                <Stack spacing={3}>{children}</Stack>
            </Stack>
        </Box>
    );
}
