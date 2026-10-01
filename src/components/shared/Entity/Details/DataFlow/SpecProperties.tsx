import type { SpecDetailsNode } from 'src/api/gql/dataFlow';
import type { DataFlowNode } from 'src/components/shared/Entity/Details/DataFlow/types';

import { Box, Skeleton, Tooltip, Typography } from '@mui/material';

import { formatDistanceToNow } from 'date-fns';

import {
    formatAlertType,
    getModelFacts,
} from 'src/components/shared/Entity/Details/DataFlow/details';

interface Property {
    label: string;
    value: string;
    // Full detail on hover when the value is a summary or may truncate.
    title?: string;
    tone?: 'error' | 'muted';
}

const LABEL_WIDTH = 116;
const ROW_HEIGHT = 28;

// "2 hours ago" rather than date-fns' "about 2 hours ago".
const relative = (ts: string) =>
    formatDistanceToNow(new Date(ts), { addSuffix: true }).replace(
        /^about /,
        ''
    );

const getProperties = (
    node: DataFlowNode,
    details: SpecDetailsNode
): Property[] => {
    const properties: Property[] = [];
    const model = getModelFacts(node.kind, details.liveSpec?.model);
    const controller = details.status?.controller;

    if (model.connector) {
        properties.push({
            label: node.kind === 'derivation' ? 'Runtime' : 'Connector',
            value: model.connector,
            title: model.connector,
        });
    }

    if (model.key) {
        properties.push({
            label: 'Key',
            value: model.key.join(', '),
            title: model.key.join(', '),
        });
    }

    if (model.bindings) {
        properties.push({
            label: 'Bindings',
            value:
                model.bindings.disabled > 0
                    ? `${model.bindings.enabled} enabled, ${model.bindings.disabled} disabled`
                    : String(model.bindings.enabled),
        });
    }

    if (model.sourceCapture) {
        properties.push({
            label: 'Source capture',
            value: model.sourceCapture,
            title: model.sourceCapture,
        });
    }

    // The header already shows the status summary, which is often the
    // connector's own message; only repeat it when it says something else.
    const connector = details.status?.connector;
    if (connector && connector.message !== node.statusSummary) {
        properties.push({
            label: 'Connector status',
            value: connector.message,
            title: `${connector.message} (${relative(connector.ts)})`,
        });
    }

    const autoDiscover = controller?.autoDiscover;
    if (node.kind === 'capture' && autoDiscover) {
        properties.push(
            autoDiscover.failure
                ? {
                      label: 'Auto-discovery',
                      value: `Failing since ${relative(autoDiscover.failure.firstTs)}`,
                      title: `${autoDiscover.failure.count} failed attempts`,
                      tone: 'error',
                  }
                : {
                      label: 'Auto-discovery',
                      value: autoDiscover.lastSuccess
                          ? `Ran ${relative(autoDiscover.lastSuccess.ts)}`
                          : 'Not run yet',
                  }
        );
    }

    const schemaUpdated = controller?.inferredSchema?.schemaLastUpdated;
    if (schemaUpdated) {
        properties.push({
            label: 'Inferred schema',
            value: `Updated ${relative(schemaUpdated)}`,
            title: new Date(schemaUpdated).toLocaleString(),
        });
    }

    const alerts = details.activeAlerts ?? [];
    properties.push(
        alerts.length === 0
            ? { label: 'Alerts', value: 'None', tone: 'muted' }
            : {
                  label: 'Alerts',
                  value: alerts
                      .map(({ alertType }) => formatAlertType(alertType))
                      .join(', '),
                  title: alerts
                      .map(
                          ({ alertType, firedAt }) =>
                              `${formatAlertType(alertType)}, fired ${relative(firedAt)}`
                      )
                      .join('\n'),
                  tone: 'error',
              }
    );

    const publication = details.lastPublication;
    if (publication) {
        properties.push({
            label: 'Last published',
            value: relative(publication.publishedAt),
            title: new Date(publication.publishedAt).toLocaleString(),
        });

        const by = publication.userFullName ?? publication.userEmail;
        if (by) {
            properties.push({
                label: 'Published by',
                value: by,
                title: publication.userEmail ?? by,
            });
        }
    }

    return properties;
};

const TONE_COLORS = {
    error: 'error.main',
    muted: 'text.secondary',
} as const;

function PropertyRow({ property }: { property: Property }) {
    return (
        <Box
            component="div"
            sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: ROW_HEIGHT,
                columnGap: 1.5,
            }}
        >
            <Typography
                variant="body2"
                component="dt"
                sx={{
                    width: LABEL_WIDTH,
                    flexShrink: 0,
                    color: 'text.secondary',
                }}
            >
                {property.label}
            </Typography>
            <Tooltip
                placement="top-start"
                title={
                    property.title ? (
                        <span style={{ whiteSpace: 'pre-line' }}>
                            {property.title}
                        </span>
                    ) : (
                        ''
                    )
                }
            >
                <Typography
                    noWrap
                    variant="body2"
                    component="dd"
                    sx={{
                        m: 0,
                        minWidth: 0,
                        color: property.tone
                            ? TONE_COLORS[property.tone]
                            : 'text.primary',
                    }}
                >
                    {property.value}
                </Typography>
            </Tooltip>
        </Box>
    );
}

interface Props {
    node: DataFlowNode;
    details: SpecDetailsNode | null;
    loading: boolean;
}

// The selected spec's key facts as a label / value list.
export function SpecProperties({ node, details, loading }: Props) {
    if (!details) {
        return loading ? (
            <Box>
                {[0, 1, 2, 3].map((index) => (
                    <Skeleton
                        key={index}
                        height={ROW_HEIGHT}
                        width={index % 2 === 0 ? '80%' : '60%'}
                    />
                ))}
            </Box>
        ) : null;
    }

    return (
        <Box component="dl" sx={{ m: 0 }}>
            {getProperties(node, details).map((property) => (
                <PropertyRow key={property.label} property={property} />
            ))}
        </Box>
    );
}
