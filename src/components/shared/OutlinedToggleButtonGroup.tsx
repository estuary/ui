import {
    styled,
    ToggleButtonGroup,
    ToggleButtonGroupProps,
} from '@mui/material';

const OutlinedToggleButtonGroup = styled(ToggleButtonGroup, {
    shouldForwardProp: (props) => props !== 'buttonSelector',
})<ToggleButtonGroupProps & { buttonSelector?: string }>(
    ({ buttonSelector }) => ({
        [`${buttonSelector ?? '& .MuiToggleButton-root'}`]: {
            '&:not(:first-of-type), &:not(:last-of-type)': {
                borderRadius: 0,
            },
            '&:first-of-type': {
                borderTopLeftRadius: 4,
                borderBottomLeftRadius: 4,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
            },
            '&:last-of-type': {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: 4,
                borderBottomRightRadius: 4,
            },
        },
    })
);

export default OutlinedToggleButtonGroup;
