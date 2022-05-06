import { TableCell } from '@mui/material';
import ConnectorName from 'components/ConnectorName';
import { OpenGraph } from 'types';

interface Props {
    openGraph: OpenGraph;
}

function Connector({ openGraph }: Props) {
    return (
        <TableCell sx={{ minWidth: 100 }}>
            <ConnectorName iconSize={20} connector={openGraph} />
        </TableCell>
    );
}

export default Connector;
