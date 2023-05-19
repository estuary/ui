import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import { NavArrowDown, NavArrowRight } from 'iconoir-react';
import { useState } from 'react';
import {
    useTransformationCreate_selectedAttribute,
    useTransformationCreate_setAttributeType,
    useTransformationCreate_setSelectedAttribute,
} from 'stores/TransformationCreate/hooks';
import { DerivationAttribute } from 'stores/TransformationCreate/types';

interface Props {
    fixedAttributeType: DerivationAttribute;
    itemLabel: string;
    nestedItemLabel: string | null;
}

function CatalogListItem({
    fixedAttributeType,
    itemLabel,
    nestedItemLabel,
}: Props) {
    const selectedAttribute = useTransformationCreate_selectedAttribute();
    const setSelectedAttribute = useTransformationCreate_setSelectedAttribute();
    const setAttributeType = useTransformationCreate_setAttributeType();

    const [open, setOpen] = useState<boolean>(true);

    const handlers = {
        toggleList: () => {
            setOpen(!open);
        },
        displayAttributeSQL: (attributeId: string) => () => {
            setAttributeType(fixedAttributeType);
            setSelectedAttribute(attributeId);
        },
    };

    if (nestedItemLabel) {
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
                            <ListItemText primary={nestedItemLabel} />
                        </ListItemButton>
                    </List>
                </Collapse>
            </>
        );
    } else {
        return (
            <ListItemButton
                dense
                selected={selectedAttribute === itemLabel}
                onClick={handlers.displayAttributeSQL(itemLabel)}
                sx={{ px: 1 }}
            >
                <ListItemText primary={itemLabel} />
            </ListItemButton>
        );
    }
}

export default CatalogListItem;
