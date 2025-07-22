import type { FieldConflictOverviewProps } from 'src/components/tables/cells/types';

import { useTheme } from '@mui/material';

import { WarningTriangle } from 'iconoir-react';

import IconButtonWithPopper from 'src/components/shared/buttons/IconButtonWithPopper';
import FieldConflictOverview from 'src/components/tables/cells/fieldSelection/FieldConflictOverview';
import { hasFieldConflict } from 'src/utils/fieldSelection-utils';

const FieldConflictButton = ({ outcome }: FieldConflictOverviewProps) => {
    const theme = useTheme();

    if (!hasFieldConflict(outcome)) {
        return null;
    }

    return (
        <IconButtonWithPopper
            buttonProps={{ style: { padding: 4 } }}
            popper={<FieldConflictOverview outcome={outcome} />}
            popperProps={{ placement: 'right' }}
        >
            <WarningTriangle
                style={{
                    color:
                        theme.palette.mode === 'light'
                            ? theme.palette.warning.dark
                            : theme.palette.warning.main,
                    fontSize: 11,
                }}
            />
        </IconButtonWithPopper>
    );
};

export default FieldConflictButton;
