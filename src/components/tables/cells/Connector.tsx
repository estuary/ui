import { Box, TableCell, Tooltip } from '@mui/material';
import ConnectorName from 'components/ConnectorName';
import { tableBorderSx } from 'context/Theme';

interface Props {
    connectorName: string | null;
    connectorImage: string;
    imageTag: string;
}

function Connector({ connectorImage, connectorName, imageTag }: Props) {
    // It's possible for the connectorName property to be null, since that comes from the open graph
    // document. But the connectorImage should always be non-null as it comes from the capture's
    // live spec. We use the image as a fallback in case the open graph title is unavailable.
    const name = connectorName !== null ? connectorName : connectorImage;
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
                        connector={name}
                        iconPath={connectorImage}
                    />
                </Box>
            </Tooltip>
        </TableCell>
    );
}

export default Connector;
