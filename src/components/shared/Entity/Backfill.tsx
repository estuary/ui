import { Typography } from '@mui/material';
import BackfillButton from 'components/editor/Bindings/Backfill/BackfillButton';
import SectionWrapper from 'components/editor/Bindings/Backfill/SectionWrapper';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { useIntl } from 'react-intl';
import OnIncompatibleSchemaChange from '../../materialization/OnIncompatibleSchemaChange';
import ErrorBoundryWrapper from '../ErrorBoundryWrapper';
import WrapperWithHeader from './WrapperWithHeader';

export default function Backfill() {
    const intl = useIntl();

    const entityType = useEntityType();
    const isEdit = useEntityWorkflow_Editing();

    return isEdit || entityType === 'materialization' ? (
        <SectionWrapper>
            {isEdit ? (
                <BackfillButton
                    description={intl.formatMessage({
                        id: `workflows.collectionSelector.manualBackfill.message.${entityType}.allBindings`,
                    })}
                />
            ) : null}

            {entityType === 'materialization' ? (
                <WrapperWithHeader
                    mountClosed
                    hideBorder
                    header={
                        <Typography>
                            {intl.formatMessage({
                                id: 'workflows.advancedSettings.title',
                            })}
                        </Typography>
                    }
                >
                    <ErrorBoundryWrapper>
                        <OnIncompatibleSchemaChange />
                    </ErrorBoundryWrapper>
                </WrapperWithHeader>
            ) : null}
        </SectionWrapper>
    ) : null;
}
