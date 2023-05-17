import { List, ListItemButton, ListItemText, useTheme } from '@mui/material';
import TransformListItem from 'components/transformation/create/SQLEditor/TransformListItem';
import { Plus } from 'iconoir-react';
import { useTransformationCreate_transformConfigs } from 'stores/TransformationCreate/hooks';

function TransformList() {
    const theme = useTheme();

    const transformConfigs = useTransformationCreate_transformConfigs();

    return (
        <List disablePadding>
            {Object.entries(transformConfigs).map(([name, config]) => (
                <TransformListItem
                    key={name}
                    itemLabel={name}
                    hiddenItemLabel={config.collection}
                />
            ))}

            <ListItemButton dense sx={{ mt: 2 }}>
                <Plus style={{ color: theme.palette.primary.main }} />

                <ListItemText
                    primary="Add Transform"
                    primaryTypographyProps={{
                        variant: 'button',
                        color: 'primary',
                    }}
                    sx={{ ml: 1 }}
                />
            </ListItemButton>
        </List>
    );
}

export default TransformList;
