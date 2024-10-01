import { Stack } from '@mui/material';
import ConnectorIcon from 'components/connectors/ConnectorIcon';
import useConstant from 'use-constant';

interface Props {
    title: string | null;
    iconPath?: string | null;
    iconSize?: number;
    marginRight?: number;
}

function ConnectorName({ title, iconPath, iconSize, marginRight }: Props) {
    const connectorName = useConstant(() => title ?? '');

    const connectorIcon = useConstant(() => {
        if (typeof iconPath === 'string') {
            return iconPath;
        }
        return undefined;
    });

    return (
        <Stack
            direction="row"
            sx={{
                'wordBreak': 'break-word',
                'alignItems': 'center',
                'justifyContent': 'flex-start',
                '& > div    ': {
                    mr: marginRight ?? 2,
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
