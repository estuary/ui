import type { ConnectorRequestCardProps } from 'src/components/connectors/Grid/cards/types';

import { Stack, Typography, useTheme } from '@mui/material';

import { PlusSquare } from 'iconoir-react';

import Card from 'src/components/connectors/Grid/cards/Card';
import LegacyCard from 'src/components/connectors/Grid/cards/LegacyCard';
import Title from 'src/components/connectors/Grid/cards/Title';

function ConnectorRequestCard({ condensed }: ConnectorRequestCardProps) {
    const theme = useTheme();

    const ConnectorCard = condensed ? Card : LegacyCard;

    return (
        <ConnectorCard
            key="connector-request-tile"
            Detail={
                <Typography component="p" align="left">
                    {
                        'To request a connector for a new system, click "Contact Estuary" and submit the form.'
                    }
                </Typography>
            }
            externalLink={{
                href: 'https://github.com/estuary/connectors/issues/new?assignees=&labels=new+connector&template=request-new-connector-form.yaml&title=Request+a+connector+to+%5Bcapture+from+%7C+materialize+to%5D+%5Byour+favorite+system%5D',
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
            Title={<Title content="New Connector" />}
        />
    );
}

export default ConnectorRequestCard;
