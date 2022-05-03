import { Stack } from '@mui/material';
import ConnectorIcon from 'components/ConnectorIcon';
import useConstant from 'use-constant';
import { getConnectorName } from 'utils/misc-utils';

interface Props {
    iconPath?: string;
    iconSize?: number;
    connector: any; // TODO (typing) ConnectorTag
}

function ConnectorName({ connector, iconPath, iconSize }: Props) {
    const connectorName = useConstant(() =>
        typeof connector === 'string'
            ? connector
            : getConnectorName(connector, false)
    );

    return (
        <Stack
            direction="row"
            sx={{
                'alignItems': 'center',
                'justifyContent': 'flex-start',
                '& > div    ': {
                    mr: 2,
                    flexShrink: 0,
                },
            }}
        >
            <ConnectorIcon iconPath={iconPath} size={iconSize} />
            {connectorName}
        </Stack>
    );
}

export default ConnectorName;
