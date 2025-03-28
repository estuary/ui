import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { useEntityType } from 'src/context/EntityContext';
import { useBindingStore } from 'src/stores/Binding/Store';
import OnIncompatibleSchemaChange from 'src/components/editor/Bindings/OnIncompatibleSchemaChange';
import type { AdvancedOptionsProps } from 'src/components/editor/Bindings/AdvancedOptions/types';
import TimeTravel from 'src/components/editor/Bindings/TimeTravel';

export default function AdvancedOptions({
    bindingIndex,
    bindingUUID,
    collectionName,
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
            </Stack>
        </WrapperWithHeader>
    );
}
