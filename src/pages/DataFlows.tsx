import { useEffect } from 'react';

import { useParams } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import NavigationTabs from 'src/components/shared/NavigationTabs';
import { EntityContextProvider } from 'src/context/EntityContext';
import Captures from 'src/pages/Captures';
import Collections from 'src/pages/Collections';
import Materializations from 'src/pages/Materializations';
import { useTopBarStore } from 'src/stores/TopBar/Store';

const tabs = [
    {
        labelMessageId: 'dataFlows.tab.sources',
        path: authenticatedRoutes.dataFlows.sources.fullPath,
    },
    {
        labelMessageId: 'dataFlows.tab.collections',
        path: authenticatedRoutes.dataFlows.collections.fullPath,
    },
    {
        labelMessageId: 'dataFlows.tab.destinations',
        path: authenticatedRoutes.dataFlows.destinations.fullPath,
    },
];

const SourcesTab = () => (
    <EntityContextProvider value="capture">
        <Captures />
    </EntityContextProvider>
);

const CollectionsTab = () => (
    <EntityContextProvider value="collection">
        <Collections />
    </EntityContextProvider>
);

const DestinationsTab = () => (
    <EntityContextProvider value="materialization">
        <Materializations />
    </EntityContextProvider>
);

const tabComponents: Record<string, () => JSX.Element> = {
    sources: SourcesTab,
    collections: CollectionsTab,
    destinations: DestinationsTab,
};

const DataFlows = () => {
    const { tab = 'sources' } = useParams<{ tab: string }>();
    const ActiveTab = tabComponents[tab] ?? SourcesTab;

    const setHeaderBreadcrumbs = useTopBarStore(
        (state) => state.setHeaderBreadcrumbs
    );

    useEffect(() => {
        setHeaderBreadcrumbs([authenticatedRoutes.dataFlows.title]);
        return () => setHeaderBreadcrumbs(undefined);
    }, [setHeaderBreadcrumbs]);

    return (
        <>
            <NavigationTabs keyPrefix="data-flows-tabs" tabs={tabs} />
            <ActiveTab key={tab} />
        </>
    );
};

export default DataFlows;
