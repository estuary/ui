import { Skeleton } from '@mui/material';

import { useIntl } from 'react-intl';

import { authenticatedRoutes } from 'src/app/routes';
import ChipList from 'src/components/shared/ChipList';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { useLiveSpecs_parentCapture } from 'src/hooks/useLiveSpecs';

interface Props {
    collectionId: string | null;
}

function ParentCapture({ collectionId }: Props) {
    const intl = useIntl();

    const { data, isValidating } = useLiveSpecs_parentCapture(
        collectionId ?? null
    );

    const { generatePath } = useDetailsNavigator(
        authenticatedRoutes.captures.details.overview.fullPath
    );

    if (isValidating) {
        return <Skeleton />;
    }

    if (!data || data.length < 1) {
        return null;
    }

    const collectionList = data.map((datum) => {
        const catalogName = datum.live_specs.catalog_name;
        return {
            display: catalogName,
            link: generatePath({
                catalog_name: catalogName,
            }),
            newWindow: false,
            title: intl.formatMessage(
                {
                    id: 'detailsPanel.details.linkToEntity',
                },
                {
                    catalogName,
                }
            ),
        };
    });

    return <ChipList values={collectionList} maxChips={5} />;
}

export default ParentCapture;
