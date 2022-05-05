import { Box, Chip, styled } from '@mui/material';

interface Props {
    strings: string[];
}

const ListItem = styled('li')(({ theme }) => ({
    margin: theme.spacing(0.5),
}));

function ChipList({ strings }: Props) {
    return (
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
                        <Chip variant="outlined" size="small" label={val} />
                    </ListItem>
                );
            })}
        </Box>
    );
}

export default ChipList;
