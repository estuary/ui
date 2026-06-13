import {
    Box,
    Button,
    Collapse,
    Divider,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import ReactJson from '@microlink/react-json-view';
import { Sparks } from 'iconoir-react';

import { buildLogExplanationPrompt } from 'src/components/copilot/shared';
import { jsonViewTheme, paperBackground } from 'src/context/Theme';
import { useCopilotAssistantStore } from 'src/stores/Copilot/Store';

interface Props {
    fields: any;
    message: string;
    open: boolean;
    heightChanging: boolean;
    uuid: string;
}

function FieldsExpandedCell({
    fields,
    open,
    heightChanging,
    message,
    uuid,
}: Props) {
    const theme = useTheme();

    const openWithPrompt = useCopilotAssistantStore(
        (state) => state.openWithPrompt
    );

    return (
        <Collapse
            key={`jsonPopper_${uuid}`}
            in={open}
            onClick={(event) => {
                // When clicking inside here we don't want to close the row
                event.preventDefault();
                event.stopPropagation();
            }}
            unmountOnExit
        >
            <Box
                sx={{
                    background: paperBackground[theme.palette.mode],
                    borderBottomWidth: 1,
                    px: 3,
                    py: 2,
                    opacity: heightChanging ? 0 : undefined,
                }}
            >
                <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Typography
                        sx={{
                            fontFamily: 'Monospace',
                            whiteSpace: 'break-spaces',
                        }}
                    >
                        {message}
                    </Typography>

                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Sparks />}
                        onClick={() =>
                            openWithPrompt(
                                buildLogExplanationPrompt(message, fields)
                            )
                        }
                        sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                    >
                        Explain
                    </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {fields ? (
                    <Box
                        sx={{
                            '& .react-json-view': {
                                backgroundColor: 'transparent !important',
                            },
                        }}
                    >
                        <ReactJson
                            displayDataTypes={false}
                            displayObjectSize={false}
                            enableClipboard={false}
                            name="fields"
                            quotesOnKeys={false}
                            src={fields ?? {}}
                            style={{ wordBreak: 'break-all' }}
                            theme={jsonViewTheme[theme.palette.mode]}
                        />
                    </Box>
                ) : null}
            </Box>
        </Collapse>
    );
}

export default FieldsExpandedCell;
