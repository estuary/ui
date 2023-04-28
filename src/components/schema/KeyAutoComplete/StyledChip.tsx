import { UniqueIdentifier } from '@dnd-kit/core';
import { Chip, ChipProps, IconButton, IconButtonProps } from '@mui/material';
import { CommonProps } from '@mui/material/OverridableComponent';
import { draggableChipIconSx } from 'context/Theme';
import { MoreVert } from 'iconoir-react';

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
