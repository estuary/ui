import { useMemo } from 'react';

import { Check } from 'iconoir-react';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import type { BooleanString, OutlinedToggleButtonProps } from 'src/components/shared/buttons/types';

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
