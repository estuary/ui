import { Button, Chip, Stack, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';

// const INPUT_ID = 'source-capture-input';

const DOCS_LINK =
    'https://docs.estuary.dev/concepts/materialization/#using-sourcecapture-to-synchronize-capture-and-materialization-bindings';

function SourceCapture() {
    const formActive = useFormStateStore_isActive();

    const [sourceCaptureEnabled, setSourceCaptureEnabled] = useState(true);

    return (
        <Stack spacing={1} sx={{ mt: 2, mb: 3 }}>
            <Typography sx={{ fontWeight: 500 }}>
                <FormattedMessage id="workflows.sourceCapture.header" />
                <ExternalLink link={DOCS_LINK}>
                    <FormattedMessage id="terms.documentation" />
                </ExternalLink>
            </Typography>

            <Typography>
                <FormattedMessage id="workflows.sourceCapture.optin.message" />
            </Typography>

            <Typography variant="subtitle2">
                <FormattedMessage id="workflows.sourceCapture.optin.message2" />
            </Typography>

            <Stack
                direction="row"
                spacing={2}
                sx={{
                    alignItems: 'center',
                }}
            >
                <Button disabled={formActive}>
                    <FormattedMessage
                        id={
                            sourceCaptureEnabled
                                ? 'workflows.sourceCapture.cta.edit'
                                : 'workflows.sourceCapture.cta'
                        }
                    />
                </Button>

                {sourceCaptureEnabled ? (
                    <Chip
                        disabled={formActive}
                        label="estuary/testing_stuff/wikipedia/source-http-file"
                        color="success"
                        onDelete={() => {
                            setSourceCaptureEnabled(false);
                        }}
                    />
                ) : (
                    <Chip
                        label={
                            <FormattedMessage id="workflows.sourceCapture.selected.none" />
                        }
                        color="warning"
                    />
                )}
            </Stack>

            {/*
            <FormControl sx={{ pl: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            value={sourceCaptureEnabled}
                            checked={sourceCaptureEnabled}
                            disabled={formActive}
                            onChange={(event, checked) => {
                                event.preventDefault();
                                event.stopPropagation();

                                setSourceCaptureEnabled(checked);
                            }}
                        />
                    }
                    label={
                        <FormattedMessage id="workflows.sourceCapture.optin.label" />
                    }
                />
            </FormControl>

            <Collapse in={sourceCaptureEnabled}>
                <Stack direction="row">
                    <TextField
                        disabled={formActive}
                        helperText={
                            <FormattedMessage id="workflows.sourceCapture.input.description" />
                        }
                        id={INPUT_ID}
                        label={
                            <FormattedMessage id="workflows.sourceCapture.input.label" />
                        }
                        size="small"
                        variant="standard"
                    />
                    <Button>Select Capture</Button>
                </Stack>
            </Collapse>
*/}
        </Stack>
    );
}

export default SourceCapture;
