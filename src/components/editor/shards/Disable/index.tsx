import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Paper,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useEntityType } from 'context/EntityContext';
import { NavArrowDown } from 'iconoir-react';
import { paperBackground, paperBackgroundImage } from 'context/Theme';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import AlertBox from 'components/shared/AlertBox';
import ShardsDisableForm from './Form';

interface Props {
    renderOpen: boolean;
}

function ShardsDisable({ renderOpen }: Props) {
    const forcedToEnable = useGlobalSearchParams(
        GlobalSearchParams.FORCED_TO_ENABLE
    );

    const theme = useTheme();
    const entityType = useEntityType();

    const draftId = useEditorStore_persistedDraftId();

    if (!draftId) {
        return null;
    }

    return (
        <Paper
            sx={{
                bgcolor: () => paperBackground[theme.palette.mode],
                backgroundImage: () => paperBackgroundImage[theme.palette.mode],
                my: 3,
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                maxWidth: 'fit-content',
            }}
            variant="outlined"
        >
            <Accordion key="shard_disable" defaultExpanded={renderOpen}>
                <AccordionSummary
                    expandIcon={
                        <NavArrowDown
                            style={{
                                color: theme.palette.text.primary,
                            }}
                        />
                    }
                >
                    <Typography>
                        <FormattedMessage id="workflows.advancedSettings.title" />
                    </Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Box sx={{ mb: 3, maxWidth: 'fit-content' }}>
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
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
}

export default ShardsDisable;
