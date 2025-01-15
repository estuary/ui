import { Stack } from '@mui/material';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useEntityType } from 'context/EntityContext';
import { useBindingStore } from 'stores/Binding/Store';
import OnIncompatibleSchemaChange from '../OnIncompatibleSchemaChange';
import TimeTravel from '../TimeTravel';
import Header from './Header';
import { AdvancedOptionsProps } from './types';

export default function AdvancedOptions({
    bindingIndex,
    bindingUUID,
    collectionName,
}: AdvancedOptionsProps) {
    const entityType = useEntityType();

    const fullSourceErrorExists = useBindingStore((state) => {
        const fullSourceErrors = state.fullSourceConfigs[bindingUUID]?.errors;

        if (!fullSourceErrors) {
            return false;
        }

        return fullSourceErrors.length > 0;
    });

    if (entityType !== 'materialization') {
        return null;
    }

    return (
        <WrapperWithHeader
            forceOpen={fullSourceErrorExists}
            header={<Header errorsExist={fullSourceErrorExists} />}
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
