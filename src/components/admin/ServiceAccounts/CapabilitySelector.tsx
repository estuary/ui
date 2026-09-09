import type { Capability } from 'src/types';

import { CAPABILITY_OPTIONS } from 'src/components/admin/ServiceAccounts/shared';
import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import OutlinedToggleButtonGroup from 'src/components/shared/OutlinedToggleButtonGroup';

interface CapabilitySelectorProps {
    value: Capability;
    onChange: (capability: Capability) => void;
    size?: 'small' | 'medium';
    disabled?: boolean;
}

// Segmented read / admin control.
export function CapabilitySelector({
    value,
    onChange,
    size = 'small',
    disabled,
}: CapabilitySelectorProps) {
    return (
        <OutlinedToggleButtonGroup
            exclusive
            size={size}
            value={value}
            disabled={disabled}
            onChange={(_event, next: Capability | null) => {
                if (next) {
                    onChange(next);
                }
            }}
        >
            {CAPABILITY_OPTIONS.map((capability) => (
                <OutlinedToggleButton key={capability} value={capability}>
                    {capability}
                </OutlinedToggleButton>
            ))}
        </OutlinedToggleButtonGroup>
    );
}
