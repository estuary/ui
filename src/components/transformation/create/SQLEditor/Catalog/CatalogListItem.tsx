import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import { NavArrowDown, NavArrowRight } from 'iconoir-react';
import { useState } from 'react';
import {
    useTransformationCreate_selectedAttribute,
    useTransformationCreate_setSelectedAttribute,
} from 'stores/TransformationCreate/hooks';

interface Props {
    itemLabel: string;
    hiddenItemLabel: string;
}

function CatalogListItem({ itemLabel, hiddenItemLabel }: Props) {
    const selectedAttribute = useTransformationCreate_selectedAttribute();
    const setSelectedAttribute = useTransformationCreate_setSelectedAttribute();

    const [open, setOpen] = useState<boolean>(true);

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
            <ListItemButton
                dense
                selected={selectedAttribute === itemLabel}
                onClick={handlers.toggleList}
                sx={{
                    'px': 1,
                    '&.Mui-selected': {
                        backgroundColor: open
                            ? 'unset'
                            : 'rgba(58, 86, 202, 0.08)',
                        color: (theme) =>
                            open
                                ? theme.palette.secondary.main
                                : theme.palette.text.primary,
                    },
                }}
            >
                {open ? <NavArrowDown /> : <NavArrowRight />}

                <ListItemText
                    primary={itemLabel}
                    sx={{
                        'ml': 0.5,
                        '& .MuiListItemText-primary': {
                            fontWeight: 500,
                        },
                    }}
                />
            </ListItemButton>

            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItemButton
                        dense
                        selected={selectedAttribute === itemLabel}
                        onClick={handlers.displayAttributeSQL(itemLabel)}
                        sx={{ pl: 5 }}
                    >
                        <ListItemText primary={hiddenItemLabel} />
                    </ListItemButton>
                </List>
            </Collapse>
        </>
    );
}

export default CatalogListItem;
