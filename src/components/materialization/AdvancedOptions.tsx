import { Box, Typography } from '@mui/material';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useEntityType } from 'context/EntityContext';
import { useIntl } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';
import OnIncompatibleSchemaChange from './OnIncompatibleSchemaChange';

export default function AdvancedOptions() {
    const intl = useIntl();

    const entityType = useEntityType();

    const onIncompatibleSchemaChangeErrorExists = useBindingStore(
        (state) => state.onIncompatibleSchemaChangeErrorExists.spec
    );

    if (entityType !== 'materialization') {
        return null;
    }

    return (
        <Box style={{ maxWidth: 850 }}>
            <WrapperWithHeader
                forceOpen={onIncompatibleSchemaChangeErrorExists}
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
                <ErrorBoundryWrapper>
                    <OnIncompatibleSchemaChange />
                </ErrorBoundryWrapper>
            </WrapperWithHeader>
        </Box>
    );
}
