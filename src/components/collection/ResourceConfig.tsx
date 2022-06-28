import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/collection/ResourceConfigForm';
import Error from 'components/shared/Error';
import useConnectorTag from 'hooks/useConnectorTag';
import { useRouteStore } from 'hooks/useRouteStore';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';

interface Props {
    connectorImage: string;
    collectionName: string;
}

function ResourceConfig({ connectorImage, collectionName }: Props) {
    const { connectorTag, error } = useConnectorTag(connectorImage);

    const useEntityCreateStore = useRouteStore();

    const setResourceSchema = useEntityCreateStore(
        entityCreateStoreSelectors.setResourceSchema
    );
    useEffect(() => {
        if (connectorTag && !isEmpty(connectorTag.resource_spec_schema)) {
            setResourceSchema(connectorTag.resource_spec_schema);
        }
    }, [connectorTag, setResourceSchema]);

    if (error) {
        return <Error error={error} />;
    } else if (connectorTag) {
        return (
            <Box sx={{ p: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {collectionName}{' '}
                    <FormattedMessage id="materializationCreate.resourceConfig.heading" />
                </Typography>

                <Box sx={{ width: '100%' }}>
                    <ResourceConfigForm
                        resourceSchema={connectorTag.resource_spec_schema}
                        collectionName={collectionName}
                    />
                </Box>
            </Box>
        );
    } else {
        return null;
    }
}

export default ResourceConfig;
