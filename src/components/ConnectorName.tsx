import { Stack } from '@mui/material';
import ConnectorIcon from 'components/ConnectorIcon';
import useConstant from 'use-constant';

interface Props {
    iconPath?: string | null;
    iconSize?: number;
    title: string | null;
}

function ConnectorName({ title, iconPath, iconSize }: Props) {
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
