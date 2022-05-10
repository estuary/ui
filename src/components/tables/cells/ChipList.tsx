import { Box, Chip, styled, TableCell, Tooltip } from '@mui/material';

interface Props {
    strings: string[];
}

const ListItem = styled('li')(({ theme }) => ({
    margin: theme.spacing(0.5),
}));
const chipListHoverStyling = {
    cursor: 'pointer',
};

export const chipListWrapperStyling = {
    minWidth: 100,
    maxHeight: 100,
    overflow: 'auto',
};

function ChipList({ strings }: Props) {
    return (
        <TableCell sx={chipListWrapperStyling}>
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
                            <Tooltip title={val}>
                                <Chip
                                    label={val}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        'maxWidth': 200,
                                        'whiteSpace': 'nowrap',
                                        'overflow': 'hidden',
                                        'textOverflow': 'ellipsis',
                                        '&:hover': {
                                            ...chipListHoverStyling,
                                            background: (theme) =>
                                                theme.palette.background
                                                    .default,
                                        },
                                    }}
                                />
                            </Tooltip>
                        </ListItem>
                    );
                })}
            </Box>
        </TableCell>
    );
}

export default ChipList;
