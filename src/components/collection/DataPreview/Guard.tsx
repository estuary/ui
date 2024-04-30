import { LinearProgress } from '@mui/material';
import Error from 'components/shared/Error';
import { useTenantsHideDetails } from 'hooks/useTenants';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    collectionName: string;
}

function DataPreviewGuard({ collectionName, children }: Props) {
    const { hide, error } = useTenantsHideDetails(collectionName);

    if (hide === false) {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }

    if (hide === true) {
        // return (
        //     <AlertBox severity="info" short>
        //         <FormattedMessage id="detailsPanel.dataPreview.hidden" />
        //     </AlertBox>
        // );

        return null;
    }

    if (error) {
        return <Error severity="error" error={error} condensed />;
    }

    return <LinearProgress />;
}

export default DataPreviewGuard;
