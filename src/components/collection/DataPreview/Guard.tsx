import { Typography } from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import AlertBox from 'components/shared/AlertBox';
import Error from 'components/shared/Error';
import { useTenantsHideDetails } from 'hooks/useTenants';
import { FormattedMessage } from 'react-intl';
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
        return (
            <CardWrapper
                message={
                    <Typography component="span">
                        <FormattedMessage id="detailsPanel.dataPreview.header" />
                    </Typography>
                }
            >
                <AlertBox severity="info" short>
                    <FormattedMessage id="detailsPanel.dataPreview.hidden" />
                </AlertBox>
            </CardWrapper>
        );
    }

    if (error) {
        return <Error severity="error" error={error} condensed />;
    }

    return null;
}

export default DataPreviewGuard;
