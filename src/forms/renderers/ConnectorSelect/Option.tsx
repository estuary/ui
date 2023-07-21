import { Box } from '@mui/material';

import ConnectorName from 'components/connectors/ConnectorName';

interface Props {
    renderOptionProps: any;
    option: any;
}

function ConnectorOption({ renderOptionProps, option }: Props) {
    const { value, label } = option;

    return (
        <Box component="li" {...renderOptionProps}>
            <ConnectorName
                iconPath={value.iconPath}
                title={label}
                iconSize={30}
            />
        </Box>
    );
}

export default ConnectorOption;
