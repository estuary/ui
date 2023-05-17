import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';
import { useState } from 'react';

interface Props {
    itemLabel: string;
    hiddenItemLabel: string;
}

function TransformListItem({ itemLabel, hiddenItemLabel }: Props) {
    const [open, setOpen] = useState<boolean>(false);

    const toggleList = () => {
        setOpen(!open);
    };

    return (
        <>
            <ListItemButton dense onClick={toggleList}>
                <ListItemText
                    primary={itemLabel}
                    sx={{
                        '& .MuiListItemText-primary': {
                            fontWeight: 500,
                        },
                    }}
                />

                {open ? <NavArrowUp /> : <NavArrowDown />}
            </ListItemButton>

            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItemButton dense sx={{ pl: 4 }}>
                        <ListItemText primary={hiddenItemLabel} />
                    </ListItemButton>
                </List>
            </Collapse>
        </>
    );
}

export default TransformListItem;
