import {
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Typography,
} from '@mui/material';
import SchemaMode from 'components/editor/Bindings/SchemaMode';
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
                    label={intl.formatMessage({ id: 'Delta Updates' })}
                />
                When adding new bindings from a source capture to a
                materialization, how should the schema of the materialization
                binding be set.
            </FormControl>

            <SchemaMode />
        </Stack>
    );
}

export default OptionalSettings;
