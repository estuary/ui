import type { Capability } from 'src/types';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import OutlinedToggleButtonGroup from 'src/components/shared/OutlinedToggleButtonGroup';

import { CAPABILITY_OPTIONS, capabilityColor } from 'src/components/admin/ServiceAccounts/shared';

interface CapabilitySelectorProps {
    value: Capability;
    onChange: (capability: Capability) => void;
    size?: 'small' | 'medium';
    disabled?: boolean;
}

// Segmented read / write / admin control. Each option lights up in its own
// capability color when selected.
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
                <OutlinedToggleButton
                    key={capability}
                    value={capability}
                    color={capabilityColor(capability)}
                >
                    {capability}
                </OutlinedToggleButton>
            ))}
        </OutlinedToggleButtonGroup>
    );
}
