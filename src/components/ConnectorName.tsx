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
    const connectorName = useConstant(() => getConnectorName(connector, false));

    return (
        <Stack direction="row">
            <img width={size} height={size} src={path} alt="" />
            {connectorName}
        </Stack>
    );
}

export default ConnectorName;
