import { useMemo } from 'react';

import { useCopilotReadable } from '@copilotkit/react-core';
import { useLocation } from 'react-router';

import { useConnectorTag_nullable } from 'src/context/ConnectorTag';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

// Maps a pathname to a human-readable description of where the user is, so the
// assistant has a sense of context even on pages without a connector/entity.
const describeSection = (pathname: string): string => {
    if (pathname.startsWith('/captures')) {
        return 'Captures (data sources)';
    }
    if (pathname.startsWith('/materializations')) {
        return 'Materializations (data destinations)';
    }
    if (pathname.startsWith('/collections')) {
        return 'Collections';
    }
    if (pathname.startsWith('/admin')) {
        return 'Admin settings';
    }
    if (pathname.startsWith('/beta-onboarding') || pathname.startsWith('/register')) {
        return 'Onboarding';
    }
    if (pathname.startsWith('/dashboard') || pathname === '/') {
        return 'Dashboard';
    }
    return pathname;
};

// Exposes the current page (section, entity, connector, docs URL) to the
// CopilotKit assistant via useCopilotReadable. Uses the nullable connector-tag
// accessor and the URL so it is safe to mount globally — it never throws on
// pages that are outside a connector workflow.
export default function useCopilotPageContext() {
    const { pathname } = useLocation();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const connectorTagState = useConnectorTag_nullable();

    const connector =
        connectorTagState && connectorTagState.applicable
            ? connectorTagState.data
            : null;

    const context = useMemo(
        () => ({
            section: describeSection(pathname),
            path: pathname,
            entityName: catalogName || null,
            connectorName: connector?.connector?.title ?? null,
            connectorImage: connector?.connector?.imageName ?? null,
            connectorDocumentationUrl: connector?.documentationUrl ?? null,
        }),
        [pathname, catalogName, connector]
    );

    useCopilotReadable({
        description:
            'The Estuary Flow dashboard page the user is currently viewing, including the active connector and its documentation URL when applicable. Ground answers in this context.',
        value: context,
    });
}
