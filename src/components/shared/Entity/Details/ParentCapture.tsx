import { Chip } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import useDetailsNavigator from 'hooks/useDetailsNavigator';
import { useLiveSpecs_parentCapture } from 'hooks/useLiveSpecs';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

interface Props {
    collectionId: string | null;
}

function ParentCapture({ collectionId }: Props) {
    const intl = useIntl();
    const navigate = useNavigate();

    const { parentSpecName, isValidating } = useLiveSpecs_parentCapture(
        collectionId ?? null
    );

    const { generatePath } = useDetailsNavigator(
        authenticatedRoutes.captures.details.overview.fullPath
    );

    return (
        //         <Button
        //     disabled={isValidating}
        //     onClick={() => {
        //         navigate(generatePath({ catalog_name: parentSpecName }));
        //     }}
        //     variant="text"
        //     sx={{ ...linkButtonSx }}
        // >
        //     {isValidating
        //         ? intl.formatMessage({ id: 'common.loading' })
        //         : parentSpecName}
        // </Button>
        <Chip
            disabled={isValidating}
            onClick={() => {
                navigate(generatePath({ catalog_name: parentSpecName }));
            }}
            label={
                isValidating
                    ? intl.formatMessage({ id: 'common.loading' })
                    : parentSpecName
            }
        />
    );
}

export default ParentCapture;
