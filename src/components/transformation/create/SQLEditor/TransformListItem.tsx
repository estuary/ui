import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';
import { useState } from 'react';
import { useTransformationCreate_setSelectedAttribute } from 'stores/TransformationCreate/hooks';

interface Props {
    itemLabel: string;
    hiddenItemLabel: string;
}

function TransformListItem({ itemLabel, hiddenItemLabel }: Props) {
    const setSelectedAttribute = useTransformationCreate_setSelectedAttribute();

    const [open, setOpen] = useState<boolean>(false);

    const handlers = {
        toggleList: () => {
            setOpen(!open);
        },
        displayAttributeSQL: (attributeId: string) => () => {
            setSelectedAttribute(attributeId);
        },
    };

    return (
        <>
            <ListItemButton dense onClick={handlers.toggleList} sx={{ px: 1 }}>
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
                    <ListItemButton
                        dense
                        onClick={handlers.displayAttributeSQL(itemLabel)}
                        sx={{ pl: 3 }}
                    >
                        <ListItemText primary={hiddenItemLabel} />
                    </ListItemButton>
                </List>
            </Collapse>
        </>
    );
}

export default TransformListItem;
