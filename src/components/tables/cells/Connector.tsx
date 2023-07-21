import { Box, TableCell, Tooltip } from '@mui/material';

import ConnectorIcon from 'components/connectors/ConnectorIcon';

interface Props {
    connectorName: string | null;
    connectorImage: string | null;
    imageTag: string;
}

const iconSize = 40;

function Connector({ connectorImage, connectorName, imageTag }: Props) {
    return (
        <TableCell
            sx={{
                minWidth: iconSize,
                maxWidth: 'min-content',
            }}
        >
            <Tooltip title={connectorName ?? imageTag} placement="bottom-start">
                <Box>
                    <ConnectorIcon iconPath={connectorImage} size={iconSize} />
                </Box>
            </Tooltip>
        </TableCell>
    );
}

export default Connector;
