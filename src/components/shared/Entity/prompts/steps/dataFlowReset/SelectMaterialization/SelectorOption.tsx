import { Stack, Typography } from '@mui/material';
import ChipList from 'components/shared/ChipList';
import { truncateTextSx } from 'context/Theme';
import { MaterializationSelectorOptionProps } from './types';

function SelectorOption({ option }: MaterializationSelectorOptionProps) {
    const { catalog_name, reads_from } = option;

    return (
        <Stack component="span" direction="column" spacing={1}>
            <Typography
                component="span"
                sx={{
                    ...truncateTextSx,
                }}
            >
                {catalog_name}
            </Typography>

            <ChipList values={reads_from} maxChips={3} />
        </Stack>
    );
}

export default SelectorOption;
