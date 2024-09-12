import { Stack, Typography } from '@mui/material';
import ConnectorIcon from 'components/connectors/ConnectorIcon';
import { truncateTextSx } from 'context/Theme';
import { MaterializationSelectorOptionProps } from './types';

function MaterializationSelectorOption({
    name,
    logo,
}: MaterializationSelectorOptionProps) {
    return (
        <Stack component="span" direction="row" spacing={1}>
            <ConnectorIcon iconPath={logo} />

            <Typography
                component="span"
                sx={{
                    ...truncateTextSx,
                }}
            >
                {name}
            </Typography>
        </Stack>
    );
}

export default MaterializationSelectorOption;
