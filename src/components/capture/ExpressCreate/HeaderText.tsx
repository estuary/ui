import { Typography } from '@mui/material';

import { useConnectorTag } from 'src/context/ConnectorTag';

export const ExpressHeaderText = () => {
    const connectorTag = useConnectorTag();

    return <Typography variant="h6">{connectorTag.connector.title}</Typography>;
};
