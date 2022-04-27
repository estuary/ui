import { Stack } from '@mui/material';
import useConstant from 'use-constant';
import { getConnectorName } from 'utils/misc-utils';

interface Props {
    size?: number;
    path: string;
    connector: any; // TODO (typing) ConnectorTag
}

const defaultSize = 15;

function ConnectorName({ size = defaultSize, connector, path }: Props) {
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
                'justifyContent': 'center',
                '& > img': {
                    mr: 2,
                    flexShrink: 0,
                },
            }}
        >
            <img width={size} height={size} src={path} loading="lazy" alt="" />
            {connectorName}
        </Stack>
    );
}

export default ConnectorName;
