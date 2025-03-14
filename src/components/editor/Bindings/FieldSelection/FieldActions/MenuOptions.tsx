import {
    Box,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
} from '@mui/material';
import { useIntl } from 'react-intl';
import { SelectionAlgorithm } from 'stores/Binding/slices/FieldSelection';
import { useBindingStore } from 'stores/Binding/Store';

export default function MenuOptions() {
    const intl = useIntl();

    const selectionAlgorithm = useBindingStore(
        (state) => state.selectionAlgorithm
    );
    const setSelectionAlgorithm = useBindingStore(
        (state) => state.setSelectionAlgorithm
    );

    return (
        <RadioGroup
            onChange={(event) =>
                setSelectionAlgorithm(event.target.value as SelectionAlgorithm)
            }
            value={selectionAlgorithm}
            style={{ maxWidth: 320, textWrap: 'wrap' }}
        >
            <FormControlLabel
                value="recommended"
                control={<Radio size="small" />}
                label={
                    <Box style={{ padding: '8px 0px' }}>
                        <Typography
                            sx={{
                                mb: '4px',
                                fontWeight: 500,
                            }}
                        >
                            {intl.formatMessage({
                                id: 'fieldSelection.massActionMenu.recommended.label',
                            })}
                        </Typography>

                        <Typography
                            sx={{
                                'textTransform': 'lowercase',
                                '&.MuiTypography-root:first-letter': {
                                    textTransform: 'uppercase',
                                },
                            }}
                        >
                            {intl.formatMessage({
                                id: 'fieldSelection.massActionMenu.recommended.description',
                            })}
                        </Typography>
                    </Box>
                }
                style={{ alignItems: 'flex-start' }}
            />

            <FormControlLabel
                value="excludeAll"
                control={<Radio size="small" />}
                label={
                    <Box style={{ padding: '8px 0px' }}>
                        <Typography
                            sx={{
                                mb: '4px',
                                fontWeight: 500,
                            }}
                        >
                            {intl.formatMessage({
                                id: 'fieldSelection.massActionMenu.excludeAll.label',
                            })}
                        </Typography>

                        <Typography
                            sx={{
                                'textTransform': 'lowercase',
                                '&.MuiTypography-root:first-letter': {
                                    textTransform: 'uppercase',
                                },
                            }}
                        >
                            {intl.formatMessage({
                                id: 'fieldSelection.massActionMenu.excludeAll.description',
                            })}
                        </Typography>
                    </Box>
                }
                style={{ alignItems: 'flex-start' }}
            />
        </RadioGroup>
    );
}
