import { Box, TableCell, Tooltip } from '@mui/material';
import ConnectorName from 'components/ConnectorName';
import { tableBorderSx } from 'context/Theme';

interface Props {
    connectorName: string;
    connectorImage: string;
    imageTag: string;
}

function Connector({ connectorImage, connectorName, imageTag }: Props) {
    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                minWidth: 100,
            }}
        >
            <Tooltip title={imageTag} placement="bottom-start">
                <Box>
                    <ConnectorName
                        iconSize={20}
                        connector={connectorName}
                        iconPath={connectorImage}
                    />
                </Box>
            </Tooltip>
        </TableCell>
    );
}

export default Connector;
