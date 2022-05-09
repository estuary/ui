import { Box, Chip, styled, TableCell } from '@mui/material';
import { grey } from '@mui/material/colors';

interface Props {
    strings: string[];
}

const ListItem = styled('li')(({ theme }) => ({
    margin: theme.spacing(0.5),
}));
const chipListHoverStyling = {
    background: grey[200],
    cursor: 'pointer',
    maxWidth: 1000,
};

export const chipListWrapperStyling = {
    'minWidth': 100,
    'maxHeight': 100,
    'overflow': 'auto',
    '&:hovera': {
        'background': grey[50],
        'cursor': 'pointer',
        '& .MuiChip-root': {
            ...chipListHoverStyling,
        },
    },
};

function ChipList({ strings }: Props) {
    const handlers = {
        onClick: () => {
            console.log('hey there');
        },
    };
    return (
        <TableCell sx={chipListWrapperStyling} onClick={handlers.onClick}>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    listStyle: 'none',
                    p: 0,
                    m: 0,
                    overflow: 'auto',
                    maxHeight: 100,
                }}
                component="ul"
            >
                {strings.map((val, index) => {
                    return (
                        <ListItem key={`${val}-${index}`}>
                            <Chip
                                label={val}
                                size="small"
                                variant="outlined"
                                sx={{
                                    'transition': (theme) =>
                                        `max-width ${theme.transitions.duration.standard}ms`,
                                    'maxWidth': 200,
                                    'whiteSpace': 'nowrap',
                                    'overflow': 'hidden',
                                    'textOverflow': 'ellipsis',
                                    '&:hover': {
                                        ...chipListHoverStyling,
                                        transition: (theme) =>
                                            `max-width ${theme.transitions.duration.standard}ms`,
                                    },
                                }}
                            />
                        </ListItem>
                    );
                })}
            </Box>
        </TableCell>
    );
}

export default ChipList;
