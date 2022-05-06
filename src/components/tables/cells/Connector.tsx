import { Box, TableCell, Tooltip } from '@mui/material';
import ConnectorName from 'components/ConnectorName';
import { OpenGraph } from 'types';

interface Props {
    openGraph: OpenGraph;
    imageTag: string;
}

function Connector({ openGraph, imageTag }: Props) {
    console.log(imageTag);

    return (
        <TableCell sx={{ minWidth: 100 }}>
            <Tooltip title={imageTag} placement="bottom-start">
                <Box>
                    <ConnectorName iconSize={20} connector={openGraph} />
                </Box>
            </Tooltip>
        </TableCell>
    );
}

export default Connector;
