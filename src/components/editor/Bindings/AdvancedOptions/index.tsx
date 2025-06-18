import type { AdvancedOptionsProps } from 'src/components/editor/Bindings/AdvancedOptions/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import Backfill from 'src/components/editor/Bindings/Backfill';
import OnIncompatibleSchemaChange from 'src/components/editor/Bindings/OnIncompatibleSchemaChange';
import TimeTravel from 'src/components/editor/Bindings/TimeTravel';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { useEntityType } from 'src/context/EntityContext';
import { useBindingStore } from 'src/stores/Binding/Store';

export default function AdvancedOptions({
    bindingIndex,
    bindingUUID,
    collectionName,
    collectionEnabled,
}: AdvancedOptionsProps) {
    const intl = useIntl();

    const entityType = useEntityType();

    const fullSourceErrorExists = useBindingStore((state) => {
        const fullSourceErrors = state.fullSourceConfigs[bindingUUID]?.errors;

        if (!fullSourceErrors) {
            return false;
        }

        return fullSourceErrors.length > 0;
    });

    const onIncompatibleSchemaChangeErrorExists = useBindingStore(
        (state) => state.onIncompatibleSchemaChangeErrorExists.binding
    );

    if (entityType !== 'materialization') {
        return null;
    }

    return (
        <WrapperWithHeader
            forceOpen={
                fullSourceErrorExists || onIncompatibleSchemaChangeErrorExists
            }
            header={
                <Typography variant="formSectionHeader">
                    {intl.formatMessage({
                        id: 'workflows.advancedSettings.title',
                    })}
                </Typography>
            }
            hideBorder
            mountClosed
        >
            <Stack spacing={4}>
                <ErrorBoundryWrapper>
                    <OnIncompatibleSchemaChange bindingIndex={bindingIndex} />
                </ErrorBoundryWrapper>

                <TimeTravel
                    bindingUUID={bindingUUID}
                    collectionName={collectionName}
                />

                {/*Capture shows this in ResourceConfig*/}
                <Backfill
                    bindingIndex={bindingIndex}
                    collection={collectionName}
                    collectionEnabled={Boolean(collectionEnabled)}
                />
            </Stack>
        </WrapperWithHeader>
    );
}
