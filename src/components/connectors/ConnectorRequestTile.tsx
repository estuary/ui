import { Typography, useTheme } from '@mui/material';

import ConnectorCardTitle from './card/Title';
import { PlusSquare } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

import ConnectorCard from 'src/components/connectors/card';

function ConnectorRequestTile() {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <ConnectorCard
            key="connector-request-tile"
            logo={
                <PlusSquare
                    style={{
                        fontSize: '3rem',
                        color: theme.palette.text.primary,
                    }}
                />
            }
            details={
                <Typography component="p" align="left">
                    <FormattedMessage id="connectors.main.message2.alt" />
                </Typography>
            }
            title={
                <ConnectorCardTitle
                    title={intl.formatMessage({
                        id: 'connectorTable.data.connectorRequest',
                    })}
                />
            }
            externalLink={{
                href: intl.formatMessage({
                    id: 'connectors.main.message2.docPath',
                }),
                target: '_blank',
                rel: 'noopener',
            }}
        />
    );
}

export default ConnectorRequestTile;
