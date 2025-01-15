import { Stack, Typography } from '@mui/material';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useEntityType } from 'context/EntityContext';
import { useIntl } from 'react-intl';
import OnIncompatibleSchemaChange from './OnIncompatibleSchemaChange';
import TimeTravel from './TimeTravel';
import { AdvancedOptionsProps } from './types';

export default function AdvancedOptions({
    bindingIndex,
    bindingUUID,
    collectionName,
}: AdvancedOptionsProps) {
    const intl = useIntl();

    const entityType = useEntityType();

    if (entityType !== 'materialization') {
        return null;
    }

    return (
        <WrapperWithHeader
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
