import { Box } from '@mui/material';
import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import OutlinedToggleButtonGroup from 'src/components/shared/OutlinedToggleButtonGroup';
import { useIntl } from 'react-intl';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';

export default function SectionFormatter() {
    const intl = useIntl();

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
                    {intl.formatMessage({
                        id: 'details.ops.status.cta.formatted',
                    })}
                </OutlinedToggleButton>

                <OutlinedToggleButton
                    size="small"
                    value="code"
                    selected={format === 'code'}
                    onClick={(_event, value) => setFormat(value, 'dashboard')}
                >
                    {intl.formatMessage({ id: 'details.ops.status.cta.raw' })}
                </OutlinedToggleButton>
            </OutlinedToggleButtonGroup>
        </Box>
    );
}
