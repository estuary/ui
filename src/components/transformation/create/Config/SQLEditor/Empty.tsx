import { Box, Divider, Typography } from '@mui/material';
import { defaultOutline } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import { DEFAULT_HEIGHT } from 'utils/editor-utils';

interface Props {
    editorHeight?: number;
}

function EmptySQLEditor({ editorHeight = DEFAULT_HEIGHT }: Props) {
    return (
        <Box sx={{ border: (theme) => defaultOutline[theme.palette.mode] }}>
            <Box sx={{ height: 37 }} />

            <Divider />

            <Box sx={{ height: editorHeight, p: 1 }}>
                <Typography>
                    <FormattedMessage id="newTransform.config.alert.noTransformSelected" />
                </Typography>
            </Box>
        </Box>
    );
}

export default EmptySQLEditor;
