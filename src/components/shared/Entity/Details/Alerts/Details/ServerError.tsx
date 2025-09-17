import type { AlertDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Box, boxClasses, Paper, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import ServerErrorDetail from 'src/components/shared/Alerts/ServerErrorDetails';
import ServerErrorDialog from 'src/components/shared/Entity/Details/Alerts/Details/ServerErrorDialog';
import { BUTTON_TRANSITION_TIME } from 'src/components/shared/Entity/Details/Alerts/Details/shared';
import { defaultOutline } from 'src/context/Theme';

const maxLineForPreview = 6;

function ServerError(props: AlertDetailsProps) {
    const {
        detail: { dataVal },
    } = props;
    const intl = useIntl();
    const theme = useTheme();

    // Just being safe on the rare case we do not get the data we're expecting
    if (!dataVal) {
        return null;
    }

    const previewLines = dataVal.split('\n');
    const previewLineCount = previewLines.length;
    const dataValIsLong = previewLineCount > maxLineForPreview;

    const previewContent = !dataValIsLong
        ? dataVal
        : `${previewLines.splice(0, maxLineForPreview).join('\n')}\n${intl.formatMessage(
              { id: 'alerts.details.preview' },
              {
                  lineCount: previewLineCount - maxLineForPreview,
              }
          )}`;

    return (
        <Paper
            sx={{
                border: defaultOutline[theme.palette.mode],
                display: 'grid',
                height: 150,
                maxHeight: 150,
                [`& > button,& > .${boxClasses.root}`]: {
                    gridColumn: 1,
                    gridRow: 1,
                },
                [`& > button`]: {
                    alignSelf: 'end',
                    justifySelf: 'end',
                },
                [`&:hover > button,  &:focus > button`]: {
                    opacity: 0.5,
                    transition: BUTTON_TRANSITION_TIME,
                },
            }}
        >
            <Box
                // This box is here so the editor showing details resizes correctly
                sx={{
                    flex: 1,
                    minWidth: 0,
                }}
            >
                <ServerErrorDetail
                    options={{
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                    }}
                    val={previewContent}
                />
            </Box>
            <ServerErrorDialog {...props} />
        </Paper>
    );
}

export default ServerError;
