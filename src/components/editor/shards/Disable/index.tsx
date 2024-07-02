import { Box, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useEntityType } from 'context/EntityContext';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import AlertBox from 'components/shared/AlertBox';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ShardsDisableForm from './Form';

interface Props {
    renderOpen: boolean;
}

function ShardsDisable({ renderOpen }: Props) {
    const forcedToEnable = useGlobalSearchParams(
        GlobalSearchParams.FORCED_TO_ENABLE
    );

    const entityType = useEntityType();

    const draftId = useEditorStore_persistedDraftId();

    if (!draftId) {
        return null;
    }

    return (
        <Box sx={{ mb: 3, maxWidth: 'fit-content' }}>
            <WrapperWithHeader
                forceOpen={Boolean(forcedToEnable || renderOpen)}
                header={
                    <Typography>
                        <FormattedMessage id="workflows.advancedSettings.title" />
                    </Typography>
                }
            >
                {forcedToEnable ? (
                    <Box sx={{ mb: 2 }}>
                        <AlertBox
                            short
                            severity="warning"
                            title={
                                <FormattedMessage
                                    id="workflows.disable.autoEnabledAlert.title"
                                    values={{
                                        entityType,
                                    }}
                                />
                            }
                        >
                            <FormattedMessage
                                id="workflows.disable.autoEnabledAlert.message"
                                values={{
                                    entityType,
                                }}
                            />
                        </AlertBox>
                    </Box>
                ) : null}

                <Stack spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="formSectionHeader">
                        <FormattedMessage
                            id="workflows.disable.title"
                            values={{ entityType }}
                        />
                    </Typography>

                    <Typography component="div">
                        <FormattedMessage
                            id="workflows.disable.message"
                            values={{ entityType }}
                        />
                    </Typography>
                </Stack>

                <ShardsDisableForm />
            </WrapperWithHeader>
        </Box>
    );
}

export default ShardsDisable;
