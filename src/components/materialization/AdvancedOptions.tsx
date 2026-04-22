import { Box, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import OnIncompatibleSchemaChange from 'src/components/materialization/OnIncompatibleSchemaChange';
import TargetNamingUpdateWrapper from 'src/components/materialization/targetNaming/UpdateWrapper';
import Backfill from 'src/components/shared/Entity/Backfill';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { useEntityType } from 'src/context/EntityContext';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useTargetNaming_model } from 'src/stores/TargetNaming/hooks';

export default function AdvancedOptions() {
    const intl = useIntl();

    const entityType = useEntityType();

    const onIncompatibleSchemaChangeErrorExists = useBindingStore(
        (state) => state.onIncompatibleSchemaChangeErrorExists.spec
    );

    const targetNamingModel = useTargetNaming_model();

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

                {targetNamingModel === 'rootTargetNaming' ? (
                    <ErrorBoundryWrapper>
                        <TargetNamingUpdateWrapper />
                    </ErrorBoundryWrapper>
                ) : null}

                <Backfill />
            </WrapperWithHeader>
        </Box>
    );
}
