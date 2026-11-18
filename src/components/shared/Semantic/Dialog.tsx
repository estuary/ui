import type { DialogProps } from '@mui/material';
import type { BranchProps } from 'react-semantic-tree';

import { forwardRef } from 'react';

import { Dialog as MUIDialog } from '@mui/material';

import { Branch } from 'react-semantic-tree';

interface SemanticDialogProps extends DialogProps {
    semantic?: Pick<BranchProps, 'label' | 'metadata' | 'events'>;
}

export const Dialog = forwardRef<HTMLDivElement, SemanticDialogProps>(
    function SemanticDialog({ children, semantic, ...props }, ref) {
        return (
            <MUIDialog {...props} ref={ref}>
                {/* Restore the inherited semantic path inside the dialog portal. */}
                <Branch {...semantic}>{children}</Branch>
            </MUIDialog>
        );
    }
);
