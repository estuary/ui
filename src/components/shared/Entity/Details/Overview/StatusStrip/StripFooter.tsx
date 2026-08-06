import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import { Stack, Tooltip, Typography, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import ConnectorName from 'src/components/connectors/ConnectorName';
import DataPlane from 'src/components/shared/Entity/DataPlane';
import { TIME_SETTINGS } from 'src/components/shared/Entity/Details/Overview/DetailsSection/shared';
import ExternalLink from 'src/components/shared/ExternalLink';
import { diminishedTextColor } from 'src/context/Theme';
import {
    formatDataPlaneName,
    getDataPlaneScope,
    parseDataPlaneName,
} from 'src/utils/dataPlane-utils';
import { hasLength } from 'src/utils/misc-utils';

// Short forms, with the full timestamp on hover: nobody reads an exact
// creation timestamp twice, and giving it a whole row is what crowded out
// the facts that matter.
const SHORT_DATE: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
};

interface Props {
    latestLiveSpec: LiveSpecsQuery_details;
}

/**
 * The quiet row beneath the strip: connector, data plane, and timestamps.
 */
function StripFooter({ latestLiveSpec }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const dataPlaneScope = getDataPlaneScope(latestLiveSpec.data_plane_name);
    const dataPlaneName = parseDataPlaneName(
        latestLiveSpec.data_plane_name,
        dataPlaneScope
    );

    return (
        <Stack
            direction="row"
            sx={{
                alignItems: 'center',
                borderTop: `1px solid ${theme.palette.divider}`,
                color: diminishedTextColor[theme.palette.mode],
                columnGap: 2,
                flexWrap: 'wrap',
                fontSize: 11.5,
                // No top margin. CardWrapper is a flex column with a 16px
                // rowGap, so a margin here stacked on top of it and put 28px
                // between the cards and the rule where the card's own padding
                // leaves 16 above them. Even spacing all the way down now:
                // 16 above the cards, 16 to the rule, 16 to this row, and the
                // card's 16 of padding below it.
                pt: 2,
                rowGap: 0.5,
            }}
        >
            {latestLiveSpec.connectorName ? (
                <ConnectorName
                    iconPath={latestLiveSpec.connector_logo_url}
                    iconSize={16}
                    marginRight={1}
                    title={latestLiveSpec.connectorName}
                />
            ) : null}

            {hasLength(latestLiveSpec.data_plane_name) ? (
                <DataPlane
                    dataPlaneName={dataPlaneName}
                    formattedSuffix={formatDataPlaneName(dataPlaneName)}
                    logoSize={20}
                    scope={dataPlaneScope}
                />
            ) : null}

            <Tooltip
                placement="bottom"
                title={intl.formatDate(
                    latestLiveSpec.updated_at,
                    TIME_SETTINGS
                )}
            >
                <Typography component="span" sx={{ fontSize: 11.5 }}>
                    {intl.formatMessage(
                        { id: 'detailsPanel.strip.footer.updated' },
                        {
                            timestamp: intl.formatDate(
                                latestLiveSpec.updated_at,
                                SHORT_DATE
                            ),
                        }
                    )}
                </Typography>
            </Tooltip>

            <Tooltip
                placement="bottom"
                title={intl.formatDate(
                    latestLiveSpec.created_at,
                    TIME_SETTINGS
                )}
            >
                <Typography component="span" sx={{ fontSize: 11.5 }}>
                    {intl.formatMessage(
                        { id: 'detailsPanel.strip.footer.created' },
                        {
                            timestamp: intl.formatDate(
                                latestLiveSpec.created_at,
                                SHORT_DATE
                            ),
                        }
                    )}
                </Typography>
            </Tooltip>

            {latestLiveSpec.connector_tag_documentation_url ? (
                <ExternalLink
                    link={latestLiveSpec.connector_tag_documentation_url}
                >
                    {intl.formatMessage({
                        id: 'detailsPanel.strip.footer.connectorDocs',
                    })}
                </ExternalLink>
            ) : null}
        </Stack>
    );
}

export default StripFooter;
