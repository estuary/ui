import type { Capability } from 'src/types';

import { CAPABILITY_OPTIONS } from 'src/components/admin/ServiceAccounts/shared';
import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import OutlinedToggleButtonGroup from 'src/components/shared/OutlinedToggleButtonGroup';

interface CapabilitySelectorProps {
    value: Capability;
    onChange: (capability: Capability) => void;
}

// Segmented read / admin control.
export function CapabilitySelector({
    value,
    onChange,
}: CapabilitySelectorProps) {
    return (
        <OutlinedToggleButtonGroup
            exclusive
            size="small"
            value={value}
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
