import { Box } from '@mui/material';
import DerivationCatalogConfig from 'components/transformation/create/Catalog/Config';
import SQLEditor from 'components/transformation/create/Catalog/SQLEditor';
import EmptySQLEditor from 'components/transformation/create/Catalog/SQLEditor/Empty';
import DerivationCatalogEditorTabs, {
    tabProps,
} from 'components/transformation/create/Catalog/Tabs';
import { isEmpty } from 'lodash';
import { useMemo, useState } from 'react';
import {
    useTransformationCreate_attributeType,
    useTransformationCreate_catalogName,
    useTransformationCreate_migrations,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';

const EDITOR_HEIGHT = 468;

function DerivationCatalogEditor() {
    // Transformation Create Store
    const catalogName = useTransformationCreate_catalogName();
    const transformConfigs = useTransformationCreate_transformConfigs();
    const migrations = useTransformationCreate_migrations();
    const attributeType = useTransformationCreate_attributeType();

    const [activeTab, setActiveTab] = useState<number>(0);

    const showEditor = useMemo(
        () =>
            attributeType === 'transform'
                ? !isEmpty(transformConfigs)
                : !isEmpty(migrations),
        [attributeType, migrations, transformConfigs]
    );

    return (
        <Box sx={{ p: 1 }}>
            <DerivationCatalogEditorTabs
                selectedTab={activeTab}
                setSelectedTab={setActiveTab}
            />

            {tabProps[activeTab].value === 'config' ? (
                <DerivationCatalogConfig />
            ) : tabProps[activeTab].value === 'streaming' ? (
                catalogName && showEditor ? (
                    <SQLEditor
                        entityName={catalogName}
                        editorHeight={EDITOR_HEIGHT}
                    />
                ) : (
                    <EmptySQLEditor editorHeight={EDITOR_HEIGHT} />
                )
            ) : (
                <span>Advanced</span>
            )}
        </Box>
    );
}

export default DerivationCatalogEditor;
