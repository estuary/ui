import { authenticatedRoutes } from 'app/routes';

import EntityDetails from 'components/shared/Entity/Details';

import { EntityContextProvider } from 'context/EntityContext';

import usePageTitle from 'hooks/usePageTitle';

function CollectionDetails() {
    usePageTitle({
        header: authenticatedRoutes.collections.details.title,
    });
    return (
        <EntityContextProvider value="collection">
            <EntityDetails />
        </EntityContextProvider>
    );
}

export default CollectionDetails;
