import type { ConnectorRequestCardProps } from 'src/components/connectors/Grid/cards/types';

import { Stack, Typography, useTheme } from '@mui/material';

import { PlusSquare } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

import Card from 'src/components/connectors/Grid/cards/Card';
import LegacyCard from 'src/components/connectors/Grid/cards/LegacyCard';
import Title from 'src/components/connectors/Grid/cards/Title';

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
                />
            }
        />
    );
}

export default ConnectorRequestCard;
