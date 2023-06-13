import { MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { validateInput } from '.';
import { PrefixedName_Errors } from './types';

interface Props {
    defaultPrefix?: boolean;
    disabled?: boolean;
}

// TODO (prefixed name) this is not used right now but will be soon.
//  need to break out the selector for when we allow prefixedname
//  to not include the prefix we aren't doing processing we don't need
function PrefixSelector({ defaultPrefix, disabled }: Props) {
    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);
    const singleOption = objectRoles.length === 1;

    const [prefix, setPrefix] = useState(
        singleOption || defaultPrefix ? objectRoles[0] : ''
    );
    const [prefixError, setPrefixError] = useState<PrefixedName_Errors>(null);

    return (
        <Select
            disabled={disabled}
            disableUnderline
            error={Boolean(prefixError)}
            required
            size="small"
            value={prefix}
            variant="standard"
            sx={{
                'minWidth': 75,
                '& .MuiSelect-select': {
                    paddingBottom: 0.2,
                },
            }}
            onChange={(event) => {
                const prefixValue = event.target.value;

                setPrefixError(validateInput(prefixValue));
                setPrefix(prefixValue);
            }}
        >
            {objectRoles.map((objectRole) => (
                <MenuItem key={objectRole} value={objectRole}>
                    {objectRole}
                </MenuItem>
            ))}
        </Select>
    );
}

export default PrefixSelector;
