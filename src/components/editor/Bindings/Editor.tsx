import { Box } from '@mui/material';
import ResourceConfig from 'components/collection/ResourceConfig';
import { ReactNode } from 'react';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig';

interface Props {
    loading: boolean;
    skeleton: ReactNode;
    readOnly?: boolean;
}

function BindingsEditor({ loading, skeleton, readOnly = false }: Props) {
    const currentCollection = useResourceConfig_currentCollection();

    if (currentCollection) {
        return loading ? (
            <Box>{skeleton}</Box>
        ) : (
            <ResourceConfig
                collectionName={currentCollection}
                readOnly={readOnly}
            />
        );
    } else {
        return null;
    }
}

export default BindingsEditor;
