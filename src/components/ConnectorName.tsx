import { Stack } from '@mui/material';
import ConnectorIcon from 'components/ConnectorIcon';
import { OpenGraph } from 'types';
import useConstant from 'use-constant';
import { getConnectorIcon, getConnectorName } from 'utils/misc-utils';

interface Props {
    iconPath?: OpenGraph | string;
    iconSize?: number;
    connector: OpenGraph | string;
}

function ConnectorName({ connector, iconPath, iconSize }: Props) {
    const connectorName = useConstant(() =>
        typeof connector === 'string' ? connector : getConnectorName(connector)
    );

    const connectorIcon = useConstant(() =>
        typeof iconPath === 'string'
            ? iconPath
            : typeof connector !== 'string'
            ? getConnectorIcon(connector)
            : undefined
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
            <ConnectorIcon iconPath={connectorIcon} size={iconSize} />
            {connectorName}
        </Stack>
    );
}

export default ConnectorName;
