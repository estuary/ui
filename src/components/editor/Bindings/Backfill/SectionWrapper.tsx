import { Box, Stack, Typography } from '@mui/material';
import { isBeforeTrialInterval } from 'components/materialization/shared';
import TrialOnlyPrefixAlert from 'components/materialization/TrialOnlyPrefixAlert';
import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_backfilledCollections,
    useBinding_collectionMetadataProperty,
} from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { useShallow } from 'zustand/react/shallow';
import { SectionWrapperProps } from './types';

export default function SectionWrapper({
    alertMessageId,
    children,
    collection,
}: SectionWrapperProps) {
    const intl = useIntl();

    const entityType = useEntityType();

    const bindingSourceBackfillRecommended =
        useBinding_collectionMetadataProperty(
            collection,
            'sourceBackfillRecommended'
        );
    const backfilledCollections = useBinding_backfilledCollections();
    const collectionMetadata = useBindingStore(
        useShallow((state) => state.collectionMetadata)
    );

    const topLevelAlertTriggered = useMemo(
        () =>
            !collection &&
            backfilledCollections.some((name) => {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                return (
                    collectionMetadata[name].trialStorage &&
                    isBeforeTrialInterval(collectionMetadata[name].updatedAt)
                );
            }),
        [backfilledCollections, collection, collectionMetadata]
    );

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
                        messageId={alertMessageId}
                        triggered={
                            collection
                                ? Boolean(
                                      bindingSourceBackfillRecommended &&
                                          backfilledCollections.includes(
                                              collection
                                          )
                                  )
                                : topLevelAlertTriggered
                        }
                    />
                ) : null}

                <Stack spacing={3}>{children}</Stack>
            </Stack>
        </Box>
    );
}
