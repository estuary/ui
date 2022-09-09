import { Box, TableCell, Tooltip } from '@mui/material';
import ConnectorName from 'components/ConnectorName';
import { tableBorderSx } from 'context/Theme';

interface Props {
    connectorName: string | null;
    connectorImage: string | null;
    imageTag: string;
}

const iconSize = 20;

function Connector({ connectorImage, connectorName, imageTag }: Props) {
    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                minWidth: iconSize,
                maxWidth: 'min-content',
            }}
        >
            <Tooltip title={imageTag} placement="bottom-start">
                <Box>
                    <ConnectorName
                        iconSize={iconSize}
                        title={connectorName ?? imageTag}
                        iconPath={connectorImage}
                    />
                </Box>
            </Tooltip>
        </TableCell>
    );
}

export default Connector;
