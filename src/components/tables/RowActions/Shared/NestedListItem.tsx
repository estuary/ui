import {
    Collapse,
    List,
    ListItemButton,
    ListItemText,
    useTheme,
} from '@mui/material';
import { Settings } from 'iconoir-react';
import { ReactNode, useState } from 'react';

interface Props {
    catalogName: string;
    nestedItem: ReactNode;
}

function NestedListItem({ catalogName, nestedItem }: Props) {
    const theme = useTheme();

    const [open, setOpen] = useState<boolean>(false);

    const toggleList = () => {
        setOpen(!open);
    };

    return (
        <>
            <ListItemButton
                selected={open}
                onClick={toggleList}
                sx={{
                    'width': '100%',
                    'px': 1,
                    '&.MuiButtonBase-root:hover::after': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: open
                            ? 'unset'
                            : 'rgba(58, 86, 202, 0.08)',
                        color: open
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                        boxShadow: open
                            ? undefined
                            : `inset 0px 0px 0px 1px ${theme.palette.primary.main}`,
                    },
                }}
            >
                <ListItemText
                    primary={catalogName}
                    sx={{
                        'ml': 0.5,
                        '& .MuiListItemText-primary': {
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                        },
                    }}
                />

                <Settings
                    style={{
                        color: open
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                    }}
                />
            </ListItemButton>

            <Collapse
                in={open}
                timeout="auto"
                unmountOnExit
                sx={{ width: '100%' }}
            >
                <List component="div" disablePadding>
                    {nestedItem}
                </List>
            </Collapse>
        </>
    );
}

export default NestedListItem;
