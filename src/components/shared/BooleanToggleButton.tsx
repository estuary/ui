import { ToggleButtonOwnProps } from '@mui/material';
import { BooleanString } from 'components/editor/Bindings/Backfill';
import OutlinedToggleButton from 'components/shared/OutlinedToggleButton';
import { Check } from 'iconoir-react';
import { useMemo } from 'react';

function BooleanToggleButton({
    children,
    selected,
    ...theRest
}: Omit<ToggleButtonOwnProps, 'value'>) {
    const value: BooleanString = useMemo(
        () => (selected ? 'true' : 'false'),
        [selected]
    );

    return (
        <OutlinedToggleButton {...theRest} selected={selected} value={value}>
            {children}

            {selected ? (
                <Check style={{ marginLeft: 8, fontSize: 13 }} />
            ) : null}
        </OutlinedToggleButton>
    );
}

export default BooleanToggleButton;
