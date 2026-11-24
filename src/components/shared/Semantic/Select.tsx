import type { SelectProps } from '@mui/material';
import type { HTMLAttributes } from 'react';

import { forwardRef } from 'react';

import { Select as MUISelect } from '@mui/material';

import { Branch } from 'react-semantic-tree';

export const SemanticMenuSurface = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(function SemanticMenuSurface({ children, ...props }, ref) {
    return (
        <div {...props} ref={ref}>
            {/* Restore the inherited semantic path inside the menu portal. */}
            <Branch>{children}</Branch>
        </div>
    );
});

export const Select = Object.assign(
    forwardRef<HTMLDivElement, SelectProps>(function SemanticSelect(
        { MenuProps, ...props },
        ref
    ) {
        const paper = MenuProps?.slotProps?.paper;

        return (
            <MUISelect
                {...props}
                ref={ref}
                MenuProps={{
                    ...MenuProps,
                    slotProps: {
                        ...MenuProps?.slotProps,
                        paper: (ownerState) => ({
                            component: SemanticMenuSurface,
                            ...(typeof paper === 'function'
                                ? paper(ownerState)
                                : paper),
                        }),
                    },
                }}
            />
        );
    }),
    { muiName: MUISelect.muiName }
    // Preserve MUI Select's generic value inference through forwardRef.
) as typeof MUISelect;
