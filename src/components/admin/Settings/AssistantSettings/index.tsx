import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';

import { useCopilotAssistantStore } from 'src/stores/Copilot/Store';

// Admin → Settings toggle for the in-dashboard assistant. The flag is persisted
// per browser in the Copilot store; the assistant mounts only when it's on (see
// useCopilotAssistantStore.assistantEnabled).
function AssistantSettings() {
    const assistantEnabled = useCopilotAssistantStore(
        (state) => state.assistantEnabled
    );
    const setAssistantEnabled = useCopilotAssistantStore(
        (state) => state.setAssistantEnabled
    );

    return (
        <Stack direction="column" spacing={2} sx={{ m: 2, mb: 0 }}>
            <Typography component="div" variant="h6">
                Assistant
            </Typography>

            <Typography>
                Enable the in-dashboard AI assistant — the command bar at the
                top of the workspace and its in-context help actions.
            </Typography>

            <FormControlLabel
                control={
                    <Switch
                        checked={assistantEnabled}
                        onChange={(event) =>
                            setAssistantEnabled(event.target.checked)
                        }
                    />
                }
                label="Enable assistant"
            />
        </Stack>
    );
}

export default AssistantSettings;
