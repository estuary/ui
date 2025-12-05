import { useMemo } from 'react';

import { MenuItem, Select, Stack } from '@mui/material';

import { useIntl } from 'react-intl';
import { useLocalStorage } from 'react-use';

import SingleLineCode from 'src/components/content/SingleLineCode';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import { LocalStorageKeys } from 'src/utils/localStorage-utils';

interface Props {
    cidrBlocks: null | undefined | string[];
}

// Just hardcoding some stuff for now as I doubt there will be a new IP
//  version released that we'll need to support anytime soon.
const selectOptions = ['4', '6'];

function CopyCidrBlocks({ cidrBlocks }: Props) {
    const intl = useIntl();
    const parseCidrBlocks = useParseCidrBlocks();

    const splitCidrBlocks = useMemo(
        () => parseCidrBlocks(cidrBlocks),
        [cidrBlocks, parseCidrBlocks]
    );

    const [selection, setSelection] = useLocalStorage(
        LocalStorageKeys.CIDR_BLOCK_CHOICE,
        selectOptions[0]
    );

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                maxWidth: 'fit-content',
                minWidth: 'fit-content',
            }}
        >
            <Select
                onChange={(event) => {
                    setSelection(event.target.value);
                }}
                required
                size="small"
                value={selection}
                variant="outlined"
                sx={{ borderRadius: 3 }}
            >
                <MenuItem value={selectOptions[0]}>
                    {intl.formatMessage({ id: 'data.ipv4' })}
                </MenuItem>
                <MenuItem value={selectOptions[1]}>
                    {intl.formatMessage({ id: 'data.ipv6' })}
                </MenuItem>
            </Select>

            <SingleLineCode
                compact
                value={
                    splitCidrBlocks[
                        selection === selectOptions[1] ? 'ipv6' : 'ipv4'
                    ] ?? ''
                }
            />
        </Stack>
    );
}

export default CopyCidrBlocks;
