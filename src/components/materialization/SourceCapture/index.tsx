import { Chip, Stack, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import SelectCapture from './SelectCapture';

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
                <SelectCapture enabled={sourceCaptureEnabled} />

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
        </Stack>
    );
}

export default SourceCapture;
