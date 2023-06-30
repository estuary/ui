import {
    Box,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import SQLEditor from 'components/transformation/create/Config/SQLEditor';
import EmptySQLEditor from 'components/transformation/create/Config/SQLEditor/Empty';
import DerivationCatalogEditorTabs, {
    tabProps,
} from 'components/transformation/create/Config/Tabs';
import { HelpCircle } from 'iconoir-react';
import { isEmpty } from 'lodash';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useTransformationCreate_attributeType,
    useTransformationCreate_catalogName,
    useTransformationCreate_migrations,
    useTransformationCreate_selectedAttribute,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';

function DerivationCatalogEditor() {
    const intl = useIntl();
    const theme = useTheme();

    // Transformation Create Store
    const catalogName = useTransformationCreate_catalogName();
    const transformConfigs = useTransformationCreate_transformConfigs();
    const migrations = useTransformationCreate_migrations();
    const attributeType = useTransformationCreate_attributeType();
    const selectedAttribute = useTransformationCreate_selectedAttribute();

    const [activeTab, setActiveTab] = useState<number>(0);

    const showEditor = useMemo(
        () =>
            attributeType === 'transform'
                ? !isEmpty(transformConfigs)
                : !isEmpty(migrations),
        [attributeType, migrations, transformConfigs]
    );

    const transformConfig = useMemo(
        () =>
            Object.hasOwn(transformConfigs, selectedAttribute)
                ? transformConfigs[selectedAttribute]
                : null,
        [selectedAttribute, transformConfigs]
    );

    const editorHeight = useMemo(
        () => (transformConfig ? 356 : 458),
        [transformConfig]
    );

    return (
        <Box sx={{ p: 1 }}>
            <DerivationCatalogEditorTabs
                selectedTab={activeTab}
                setSelectedTab={setActiveTab}
            />

            {tabProps[activeTab].value === 'basic' ? (
                <Box sx={{ pt: 1 }}>
                    {transformConfig ? (
                        <>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">
                                    Source Collection
                                </Typography>

                                <Typography sx={{ ml: 1.5 }}>
                                    {transformConfig.collection}
                                </Typography>
                            </Box>

                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Transform Lambda
                            </Typography>
                        </>
                    ) : null}

                    {catalogName && showEditor ? (
                        <SQLEditor
                            entityName={catalogName}
                            editorHeight={editorHeight}
                        />
                    ) : (
                        <EmptySQLEditor editorHeight={editorHeight} />
                    )}
                </Box>
            ) : (
                <Stack spacing={3} sx={{ py: 2 }}>
                    {transformConfig ? (
                        <>
                            <Stack>
                                <TextField
                                    size="small"
                                    variant="standard"
                                    label="Transform Name"
                                    value={transformConfig.name}
                                />

                                <Typography
                                    variant="caption"
                                    color={theme.palette.text.secondary}
                                    sx={{ mt: '3px' }}
                                >
                                    Unique name of the transformation,
                                    containing only Unicode letters, numbers,
                                    hyphens, or underscores (no spaces or other
                                    punctuation).
                                </Typography>
                            </Stack>

                            <Box>
                                <Stack
                                    spacing={1}
                                    direction="row"
                                    sx={{ mb: 1, alignItems: 'center' }}
                                >
                                    <Typography variant="subtitle1">
                                        <FormattedMessage id="newTransform.editor.streaming.shuffleKeys.header" />
                                    </Typography>

                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: 'newTransform.editor.streaming.shuffleKeys.tooltip',
                                        })}
                                        placement="right"
                                    >
                                        <HelpCircle
                                            style={{
                                                fontSize: 12,
                                                color: theme.palette.text
                                                    .primary,
                                            }}
                                        />
                                    </Tooltip>
                                </Stack>

                                <Typography sx={{ px: 1 }}>
                                    Soon you will be able to shuffle some keys!
                                </Typography>
                            </Box>
                        </>
                    ) : null}
                </Stack>
            )}
        </Box>
    );
}

export default DerivationCatalogEditor;
