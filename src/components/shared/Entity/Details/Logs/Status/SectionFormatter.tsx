import { Box, ToggleButtonGroup } from '@mui/material';
import OutlinedToggleButton from 'components/shared/buttons/OutlinedToggleButton';
import { outlinedToggleButtonGroupStyling } from 'context/Theme';
import { useIntl } from 'react-intl';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';

export default function SectionFormatter() {
    const intl = useIntl();

    const format = useEntityStatusStore((state) => state.format);
    const setFormat = useEntityStatusStore((state) => state.setFormat);

    return (
        <Box style={{ paddingTop: 4 }}>
            <ToggleButtonGroup
                size="small"
                exclusive
                sx={outlinedToggleButtonGroupStyling}
            >
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
            </ToggleButtonGroup>
        </Box>
    );
}
