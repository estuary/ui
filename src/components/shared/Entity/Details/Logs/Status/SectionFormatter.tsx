import { Box } from '@mui/material';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import OutlinedToggleButtonGroup from 'src/components/shared/OutlinedToggleButtonGroup';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';

export default function SectionFormatter() {
    const format = useEntityStatusStore((state) => state.format);
    const setFormat = useEntityStatusStore((state) => state.setFormat);

    return (
        <Box style={{ paddingTop: 4 }}>
            <OutlinedToggleButtonGroup size="small" exclusive>
                <OutlinedToggleButton
                    size="small"
                    value="dashboard"
                    selected={format === 'dashboard'}
                    onClick={(_event, value) => setFormat(value, 'code')}
                >
                    Dashboard
                </OutlinedToggleButton>

                <OutlinedToggleButton
                    size="small"
                    value="code"
                    selected={format === 'code'}
                    onClick={(_event, value) => setFormat(value, 'dashboard')}
                >
                    Code
                </OutlinedToggleButton>
            </OutlinedToggleButtonGroup>
        </Box>
    );
}
