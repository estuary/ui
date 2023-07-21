import { authenticatedRoutes } from 'app/routes';

import EntityDetails from 'components/shared/Entity/Details';

import { EntityContextProvider } from 'context/EntityContext';

import usePageTitle from 'hooks/usePageTitle';

function CaptureDetails() {
    usePageTitle({
        header: authenticatedRoutes.captures.details.title,
    });

    return (
        <EntityContextProvider value="capture">
            <EntityDetails />
        </EntityContextProvider>
    );
}

export default CaptureDetails;
