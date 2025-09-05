import type { ConnectorSectionProps } from 'src/components/shared/Entity/Details/Overview/DetailsSection/types';

import { Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import ConnectorName from 'src/components/connectors/ConnectorName';
import ExternalLink from 'src/components/shared/ExternalLink';

function ConnectorSection({ latestLiveSpec }: ConnectorSectionProps) {
    const intl = useIntl();

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
                    {intl.formatMessage({
                        id: 'terms.documentation',
                    })}
                </ExternalLink>
            ) : null}
        </Stack>
    );
}

export default ConnectorSection;
