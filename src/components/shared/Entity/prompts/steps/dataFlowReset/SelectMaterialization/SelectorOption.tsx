import { Box, Stack, Typography } from '@mui/material';
import ChipList from 'components/shared/ChipList';
import { truncateTextSx } from 'context/Theme';
import { MaterializationSelectorOptionProps } from './types';

function SelectorOption({ option }: MaterializationSelectorOptionProps) {
    const { catalog_name, reads_from } = option;

    return (
        <Stack component="span" direction="column" spacing={2}>
            <Box
                sx={{
                    maxHeight: 20,
                }}
            >
                <Typography component="span" sx={truncateTextSx}>
                    {catalog_name}
                </Typography>
            </Box>

            <ChipList
                values={reads_from}
                maxChips={5}
                sx={{
                    pl: 10,
                    minHeight: 65,
                    maxHeight: 65,
                }}
            />
        </Stack>
    );
}

export default SelectorOption;
