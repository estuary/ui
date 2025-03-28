import type { ChipProps, IconButtonProps } from '@mui/material';
import { Chip, IconButton } from '@mui/material';
import type { CommonProps } from '@mui/material/OverridableComponent';

import type { UniqueIdentifier } from '@dnd-kit/core';
import { MoreVert } from 'iconoir-react';

import { draggableChipIconSx } from 'src/context/Theme';

interface Props {
    label: UniqueIdentifier;
    componentProps?: {
        icon?: Partial<IconButtonProps>;
        chip?: Partial<ChipProps>;
    };
    id?: string;
    style?: CommonProps['style'];
}

function StyledChip({ componentProps, id, label, style }: Props) {
    return (
        <Chip
            {...componentProps?.chip}
            id={id}
            icon={
                <IconButton size="small" {...componentProps?.icon}>
                    <MoreVert />
                </IconButton>
            }
            label={label}
            style={style}
            sx={draggableChipIconSx}
        />
    );
}

export default StyledChip;
