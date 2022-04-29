import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Stack } from '@mui/material';
import useConstant from 'use-constant';
import { getConnectorName } from 'utils/misc-utils';

interface Props {
    size?: number;
    path?: string;
    connector: any; // TODO (typing) ConnectorTag
}

const defaultSize = 20;

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
                'justifyContent': 'flex-start',
                '& > div    ': {
                    mr: 2,
                    flexShrink: 0,
                },
            }}
        >
            <div style={{ height: size, width: size }}>
                {path ? (
                    <img
                        width={size}
                        height={size}
                        src={path}
                        loading="lazy"
                        alt=""
                    />
                ) : (
                    <QuestionMarkIcon
                        sx={{
                            height: size,
                            width: size,
                        }}
                    />
                )}
            </div>
            {connectorName}
        </Stack>
    );
}

export default ConnectorName;
