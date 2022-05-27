import { Stack } from '@mui/material';
import ConnectorIcon from 'components/ConnectorIcon';
import { OpenGraph } from 'types';
import useConstant from 'use-constant';
import { getConnectorIcon } from 'utils/misc-utils';

interface Props {
    iconPath?: OpenGraph | string;
    iconSize?: number;
    connector: OpenGraph | string;
}

function ConnectorName({ connector, iconPath, iconSize }: Props) {
    const connectorName = useConstant(() =>
        typeof connector === 'string' ? connector : connector.title
    );

    const connectorIcon = useConstant(() => {
        if (typeof iconPath === 'string') {
            return iconPath;
        } else if (typeof connector !== 'string') {
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
