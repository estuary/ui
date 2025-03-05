import { Box, Typography, useTheme } from '@mui/material';
import LegacyCard from 'components/connectors/Grid/cards/LegacyCard';
import { PlusSquare } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';
import Card from './Card';
import Title from './Title';
import { ConnectorRequestCardProps } from './types';

function ConnectorRequestCard({ condensed }: ConnectorRequestCardProps) {
    const intl = useIntl();
    const theme = useTheme();

    const ConnectorCard = condensed ? Card : LegacyCard;

    return (
        <ConnectorCard
            key="connector-request-tile"
            Detail={
                <Typography component="p" align="left">
                    <FormattedMessage id="connectors.main.message2.alt" />
                </Typography>
            }
            externalLink={{
                href: intl.formatMessage({
                    id: 'connectors.main.message2.docPath',
                }),
                target: '_blank',
                rel: 'noopener',
            }}
            Logo={
                <Box style={{ paddingLeft: 16, paddingRight: 16 }}>
                    <PlusSquare
                        style={{
                            color: theme.palette.text.primary,
                            fontSize: condensed ? 24 : '3rem',
                        }}
                    />
                </Box>
            }
            Title={
                <Title
                    content={intl.formatMessage({
                        id: 'connectorTable.data.connectorRequest',
                    })}
                    marginBottom={condensed ? '4px' : undefined}
                />
            }
        />
    );
}

export default ConnectorRequestCard;
