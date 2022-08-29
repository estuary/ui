import { Box, TableCell, Tooltip } from '@mui/material';
import ConnectorName from 'components/ConnectorName';
import { tableBorderSx } from 'context/Theme';

interface Props {
    connectorName: string | null;
    connectorImage: string | null;
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
                        title={connectorName ?? imageTag}
                        iconPath={connectorImage}
                    />
                </Box>
            </Tooltip>
        </TableCell>
    );
}

export default Connector;
