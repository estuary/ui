import type { ConnectorGridNode } from 'src/api/gql/connectors';

import { useMemo } from 'react';

import { useQuery } from 'urql';

import { TASK_USAGE_MODELS_QUERY } from 'src/api/gql/billingUsage';
import { CONNECTORS_QUERY } from 'src/api/gql/connectors';
import { useAllPages } from 'src/api/gql/useAllPages';
import { parseConnectorImagePath } from 'src/utils/connector-utils';

const DERIVATION_LANGUAGES: Record<string, string> = {
    python: 'Python',
    sqlite: 'SQLite',
    typescript: 'TypeScript',
};

// A Dekaf materialization names a variant of the Dekaf image, not an image.
const getImageName = (endpoint: any): string | null => {
    if (endpoint?.connector?.image) {
        return (
            parseConnectorImagePath(endpoint.connector.image)?.imageName ?? null
        );
    }

    return endpoint?.dekaf?.variant
        ? `ghcr.io/estuary/dekaf-${endpoint.dekaf.variant}`
        : null;
};

// What a task runs: its connector's title, or a derivation's language.
function getConnectorLabel(
    model: any,
    titles: Map<string, string>
): string | null {
    const using = model?.derive?.using;

    if (using) {
        const language = Object.keys(using).find(
            (key) => key in DERIVATION_LANGUAGES
        );

        return language ? DERIVATION_LANGUAGES[language] : null;
    }

    const imageName = getImageName(model?.endpoint);

    return imageName ? (titles.get(imageName) ?? null) : null;
}

// Connector labels for the given tasks, keyed by name. A label is decoration
// beside the task's kind, so a failed read just leaves it out.
export function useTaskUsageConnectors(names: string[]) {
    const pause = names.length === 0;

    const [{ data }] = useQuery({
        query: TASK_USAGE_MODELS_QUERY,
        variables: { names },
        pause,
    });

    const connectors = useAllPages(CONNECTORS_QUERY, {
        getConnection: (result) => result.connectors,
        transform: (node: ConnectorGridNode) => node,
        pause,
    });

    return useMemo(() => {
        const titles = new Map<string, string>();
        connectors.data.forEach(({ imageName, title }) => {
            if (title) {
                titles.set(imageName, title);
            }
        });

        const labels = new Map<string, string>();
        data?.liveSpecs.edges.forEach(({ node }) => {
            const label = getConnectorLabel(node.liveSpec?.model, titles);

            if (label) {
                labels.set(node.catalogName, label);
            }
        });

        return labels;
    }, [connectors.data, data]);
}
