import { Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import SelectCapture from 'src/components/materialization/SourceCapture/SelectCapture';
import SourceCaptureChip from 'src/components/materialization/SourceCapture/SourceCaptureChip';
import ExternalLink from 'src/components/shared/ExternalLink';

const DOCS_LINK =
    'https://docs.estuary.dev/concepts/materialization/#using-sourcecapture-to-synchronize-capture-and-materialization-bindings';

function SourceCapture() {
    return (
        <Stack spacing={1}>
            <Typography variant="formSectionHeader">
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
                <SelectCapture />
                <SourceCaptureChip />
            </Stack>
        </Stack>
    );
}

export default SourceCapture;
