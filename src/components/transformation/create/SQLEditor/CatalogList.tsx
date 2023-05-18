import {
    IconButton,
    List,
    ListItem,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import CatalogListItem from 'components/transformation/create/SQLEditor/CatalogListItem';
import { Plus } from 'iconoir-react';
import { isEmpty } from 'lodash';
import { CSSProperties, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useTransformationCreate_migrations,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';
import {
    MigrationDictionary,
    TransformConfig,
    TransformConfigDictionary,
} from 'stores/TransformationCreate/types';

interface Props {
    contentType: 'transform' | 'migration';
    borderBottom?: CSSProperties['borderBottom'];
    minHeight?: number;
}

function CatalogList({ contentType, borderBottom, minHeight = 400 }: Props) {
    const theme = useTheme();

    const transformConfigs = useTransformationCreate_transformConfigs();
    const migrations = useTransformationCreate_migrations();

    const content: TransformConfigDictionary | MigrationDictionary = useMemo(
        () => (contentType === 'transform' ? transformConfigs : migrations),
        [transformConfigs, migrations]
    );

    return (
        <List
            disablePadding
            subheader={
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography
                        component="div"
                        color="secondary"
                        sx={{
                            py: 1,
                            pl: 1,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                        }}
                    >
                        <FormattedMessage
                            id={`newTransform.editor.catalog.${contentType}.header`}
                        />
                    </Typography>

                    <IconButton sx={{ borderRadius: 0 }}>
                        <Plus style={{ color: theme.palette.secondary.main }} />
                    </IconButton>
                </Stack>
            }
            sx={{
                minHeight,
                borderBottom,
            }}
        >
            {isEmpty(content) ? (
                <ListItem>
                    <Typography sx={{ mt: 1 }}>
                        <FormattedMessage
                            id="newTransform.editor.catalog.message.empty"
                            values={{ contentType }}
                        />
                    </Typography>
                </ListItem>
            ) : (
                Object.entries(content).map(
                    ([name, config]: [string, TransformConfig | string]) => (
                        <CatalogListItem
                            key={name}
                            itemLabel={name}
                            hiddenItemLabel={
                                typeof config === 'string'
                                    ? config
                                    : config.collection
                            }
                        />
                    )
                )
            )}
        </List>
    );
}

export default CatalogList;
