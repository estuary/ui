import { IconButton, List, Stack, Typography, useTheme } from '@mui/material';
import TransformListItem from 'components/transformation/create/SQLEditor/TransformListItem';
import { Plus } from 'iconoir-react';
import { CSSProperties } from 'react';
import { useTransformationCreate_transformConfigs } from 'stores/TransformationCreate/hooks';

interface Props {
    borderBottom?: CSSProperties['borderBottom'];
    minHeight?: number;
}

function TransformList({ borderBottom, minHeight = 400 }: Props) {
    const theme = useTheme();

    const transformConfigs = useTransformationCreate_transformConfigs();

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
                        Transforms
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
            {Object.entries(transformConfigs).map(([name, config]) => (
                <TransformListItem
                    key={name}
                    itemLabel={name}
                    hiddenItemLabel={config.collection}
                />
            ))}

            {/* <ListItemButton dense sx={{ mt: 2, px: 1 }}>
                <Plus style={{ color: theme.palette.primary.main }} />

                <ListItemText
                    primary="Add Transform"
                    primaryTypographyProps={{
                        variant: 'button',
                        color: 'primary',
                    }}
                    sx={{ ml: 1 }}
                />
            </ListItemButton> */}
        </List>
    );
}

export default TransformList;
