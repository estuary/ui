import {
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Typography,
} from '@mui/material';
import { useIntl } from 'react-intl';

function OptionalSettings() {
    const intl = useIntl();

    return (
        <Stack>
            <Typography>Options for bindings</Typography>

            {/*https://docs.estuary.dev/concepts/materialization/#delta-updates*/}
            <FormControl sx={{ mx: 0 }}>
                <FormControlLabel
                    control={<Checkbox value={true} />}
                    onChange={(event, checked) => {
                        console.log('clicked', [checked, event]);
                    }}
                    label={intl.formatMessage({ id: 'Delta Upates' })}
                />
            </FormControl>

            <FormControl sx={{ mx: 0 }}>
                <FormControlLabel
                    control={<Checkbox value={true} />}
                    onChange={(event, checked) => {
                        console.log('clicked', [checked, event]);
                    }}
                    label={intl.formatMessage({ id: 'Target Schema' })}
                />
            </FormControl>
        </Stack>
    );
}

export default OptionalSettings;
