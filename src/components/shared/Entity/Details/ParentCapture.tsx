import { Skeleton } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import useDetailsNavigator from 'hooks/useDetailsNavigator';
import { useLiveSpecs_parentCapture } from 'hooks/useLiveSpecs';
import { Link } from 'react-router-dom';

interface Props {
    collectionId: string | null;
}

function ParentCapture({ collectionId }: Props) {
    const { parentSpecName, isValidating } = useLiveSpecs_parentCapture(
        collectionId ?? null
    );

    const { generatePath } = useDetailsNavigator(
        authenticatedRoutes.captures.details.overview.fullPath
    );

    if (isValidating) {
        return <Skeleton />;
    }

    return (
        <Link to={generatePath({ catalog_name: parentSpecName })}>
            {parentSpecName}
        </Link>
    );
}

export default ParentCapture;
