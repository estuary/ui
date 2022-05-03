import { Box } from '@mui/material';
import ConnectorName from 'components/ConnectorName';

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
                connector={label}
                iconSize={30}
            />
        </Box>
    );
}

export default ConnectorOption;
