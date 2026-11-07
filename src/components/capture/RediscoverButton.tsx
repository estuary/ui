import { Box, IconButton, Tooltip, useTheme } from '@mui/material';

import { RefreshDouble } from 'iconoir-react';

import { useSubmitCaptureForm } from 'src/components/capture/useSubmitCaptureForm';
import { useEditorStore_isSaving } from 'src/components/editor/Store/hooks';
import { disabledButtonText } from 'src/context/Theme';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function RediscoverButton() {
    const submitForm = useSubmitCaptureForm({
        initiateRediscovery: true,
    });
    const isSaving = useEditorStore_isSaving();
    const formActive = useFormStateStore_isActive();

    const theme = useTheme();
    const disable = isSaving || formActive;

    return (
        <Tooltip
            placement="top"
            title="Refresh collections with latest from source"
        >
            <Box>
                <IconButton
                    disabled={disable}
                    onClick={() => void submitForm()}
                    sx={{ borderRadius: 0 }}
                    aria-label="Refresh"
                >
                    <RefreshDouble
                        style={{
                            color: disable
                                ? disabledButtonText[theme.palette.mode]
                                : theme.palette.primary.main,
                        }}
                    />
                </IconButton>
            </Box>
        </Tooltip>
    );
}

export default RediscoverButton;
