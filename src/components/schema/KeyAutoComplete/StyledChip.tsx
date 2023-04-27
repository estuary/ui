import { Chip, IconButton, SxProps, Theme } from '@mui/material';
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
    sx?: SxProps<Theme>;
}

function StyledChip({ componentProps, color, id, label, style, sx }: Props) {
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
            sx={{ ...draggableChipIconSx, ...sx }}
        />
    );
}

export default StyledChip;
