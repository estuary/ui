import OutlinedToggleButton from 'components/shared/buttons/OutlinedToggleButton';
import { Check } from 'iconoir-react';
import { useMemo } from 'react';
import { BooleanString, OutlinedToggleButtonProps } from './types';

function BooleanToggleButton({
    children,
    selected,
    ...props
}: Omit<OutlinedToggleButtonProps, 'value'>) {
    const value: BooleanString = useMemo(
        () => (selected ? 'true' : 'false'),
        [selected]
    );

    return (
        <OutlinedToggleButton {...props} selected={selected} value={value}>
            {children}

            {selected ? (
                <Check style={{ marginLeft: 8, fontSize: 13 }} />
            ) : null}
        </OutlinedToggleButton>
    );
}

export default BooleanToggleButton;
