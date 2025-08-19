import type { BaseFieldOutcomeProps } from 'src/components/tables/cells/types';

import { useTheme } from '@mui/material';

import { Bookmark, BookmarkSolid, WarningTriangle } from 'iconoir-react';

import IconButtonWithPopper from 'src/components/shared/buttons/IconButtonWithPopper';
import FieldOutcomeOverview from 'src/components/tables/cells/fieldSelection/FieldOutcomeOverview';
import { useBindingStore } from 'src/stores/Binding/Store';
import {
    hasFieldConflict,
    isSelectedField,
} from 'src/utils/fieldSelection-utils';

const FieldOutcomeButton = ({
    bindingUUID,
    outcome,
}: BaseFieldOutcomeProps) => {
    const theme = useTheme();

    const validationFailed = useBindingStore((state) =>
        bindingUUID ? state.selections[bindingUUID].validationFailed : false
    );

    const conflictExists = hasFieldConflict(outcome);

    const colorKey = conflictExists ? 'error' : 'primary';

    const Icon = conflictExists
        ? WarningTriangle
        : isSelectedField(outcome)
          ? BookmarkSolid
          : Bookmark;

    return (
        <IconButtonWithPopper
            buttonProps={{ style: { padding: 4 } }}
            popper={
                <FieldOutcomeOverview
                    bindingUUID={bindingUUID}
                    outcome={outcome}
                />
            }
            popperProps={{ placement: 'right' }}
            trigger="hover"
        >
            <Icon
                style={{
                    color: validationFailed
                        ? theme.palette[colorKey].alpha_26
                        : theme.palette[colorKey].main,
                    fontSize: 14,
                }}
            />
        </IconButtonWithPopper>
    );
};

export default FieldOutcomeButton;
