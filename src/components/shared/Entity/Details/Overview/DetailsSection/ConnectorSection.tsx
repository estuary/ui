import type { ConnectorSectionProps } from 'src/components/shared/Entity/Details/Overview/DetailsSection/types';

import { Stack } from '@mui/material';

import ConnectorName from 'src/components/connectors/ConnectorName';
import ExternalLink from 'src/components/shared/ExternalLink';

function ConnectorSection({ latestLiveSpec }: ConnectorSectionProps) {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: 'center',
            }}
        >
            <ConnectorName
                iconPath={latestLiveSpec.connector_logo_url}
                iconSize={20}
                marginRight={1}
                title={latestLiveSpec.connectorName}
            />

            {latestLiveSpec.connector_tag_documentation_url ? (
                <ExternalLink
                    link={latestLiveSpec.connector_tag_documentation_url}
                >
                    Docs
                </ExternalLink>
            ) : null}
        </Stack>
    );
}

export default ConnectorSection;
