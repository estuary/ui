import { Chip, IconButton } from '@mui/material';
import { draggableChipIconSx } from 'context/Theme';
import { MoreVert } from 'iconoir-react';

interface Props {
    label: string;

    color?: any;
    componentProps?: {
        icon?: any;
        chip?: any;
    };
    id?: string;
    style?: any;
}

function StyledChip({ componentProps, color, id, label, style }: Props) {
    return (
        <Chip
            {...componentProps?.chip}
            color={color}
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
