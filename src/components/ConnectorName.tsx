import { Stack } from '@mui/material';
import ConnectorIcon from 'components/ConnectorIcon';
import { OpenGraph } from 'types';
import useConstant from 'use-constant';
import { getConnectorIcon } from 'utils/misc-utils';

interface Props {
    iconPath?: OpenGraph | string | null;
    iconSize?: number;
    connector: OpenGraph | string | null;
}

function ConnectorName({ connector, iconPath, iconSize }: Props) {
    const connectorName = useConstant(() =>
        typeof connector === 'string'
            ? connector
            : connector === null
            ? ''
            : connector.title
    );

    const connectorIcon = useConstant(() => {
        if (typeof iconPath === 'string') {
            return iconPath;
        }

        if (typeof connector !== 'string' && connector !== null) {
            return getConnectorIcon(connector);
        } else {
            return undefined;
        }
    });

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
