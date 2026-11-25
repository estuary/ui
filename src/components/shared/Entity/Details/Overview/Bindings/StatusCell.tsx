import type {
    BindingStatus,
    BindingStatusVariant,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';

import { TableCell } from '@mui/material';

import {
    BINDING_STATUS_LABELS,
    getBindingStatusVariant,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { StatusPill } from 'src/components/shared/StatusPill';

const TOOLTIPS: Partial<Record<BindingStatusVariant, string>> = {
    warning:
        'Enabled, but no documents moved through it in the selected range.',
};

interface Props {
    status: BindingStatus;
    // Whether the binding moved anything in the selected range; undefined
    // while volumes are still loading.
    hasVolume?: boolean;
}

export function StatusCell({ status, hasVolume }: Props) {
    const variant = getBindingStatusVariant(status, hasVolume);

    return (
        <TableCell>
            <StatusPill
                variant={variant}
                label={BINDING_STATUS_LABELS[variant]}
                tooltip={TOOLTIPS[variant]}
            />
        </TableCell>
    );
}
