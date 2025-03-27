import { Stack, Typography, useTheme } from '@mui/material';
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
                <Stack
                    style={{
                        alignItems: 'center',
                        paddingLeft: 16,
                        paddingRight: 16,
                        width: condensed ? 100 : undefined,
                    }}
                >
                    <PlusSquare
                        style={{
                            color: theme.palette.text.primary,
                            fontSize: condensed ? 24 : '3rem',
                        }}
                    />
                </Stack>
            }
            Title={
                <Title
                    content={intl.formatMessage({
                        id: 'connectorTable.data.connectorRequest',
                    })}
                    height={condensed ? 50 : undefined}
                    marginBottom={condensed ? '4px' : undefined}
                />
            }
        />
    );
}

export default ConnectorRequestCard;
