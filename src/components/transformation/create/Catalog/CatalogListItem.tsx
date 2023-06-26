import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import { defaultOutline } from 'context/Theme';
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
    attributeId: string;
    itemLabel: string;
    nestedItemLabel?: string;
}

function CatalogListItem({
    fixedAttributeType,
    attributeId,
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
        displayAttributeSQL: (id: string) => () => {
            setAttributeType(fixedAttributeType);
            setSelectedAttribute(id);
        },
    };

    if (nestedItemLabel) {
        return (
            <>
                <ListItemButton
                    selected={selectedAttribute === attributeId}
                    onClick={handlers.toggleList}
                    sx={{
                        'width': '100%',
                        'px': 1,
                        'borderBottom': (theme) =>
                            open ? 'none' : defaultOutline[theme.palette.mode],
                        '&.Mui-selected': {
                            backgroundColor: open
                                ? 'unset'
                                : 'rgba(58, 86, 202, 0.08)',
                            color: (theme) =>
                                open
                                    ? theme.palette.primary.main
                                    : theme.palette.text.primary,
                            boxShadow: (theme) =>
                                open
                                    ? undefined
                                    : `inset 0px 0px 0px 1px ${theme.palette.primary.main}`,
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
                                whiteSpace: 'nowrap',
                            },
                        }}
                    />
                </ListItemButton>

                <Collapse
                    in={open}
                    timeout="auto"
                    unmountOnExit
                    sx={{
                        width: '100%',
                        borderBottom: (theme) =>
                            defaultOutline[theme.palette.mode],
                    }}
                >
                    <List component="div" disablePadding>
                        <ListItemButton
                            dense
                            selected={selectedAttribute === attributeId}
                            onClick={handlers.displayAttributeSQL(attributeId)}
                            sx={{
                                'pl': 5,
                                '&.Mui-selected': {
                                    boxShadow: (theme) =>
                                        `inset 0px 0px 0px 1px ${theme.palette.primary.main}`,
                                },
                            }}
                        >
                            <ListItemText
                                primary={nestedItemLabel}
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        whiteSpace: 'nowrap',
                                    },
                                }}
                            />
                        </ListItemButton>
                    </List>
                </Collapse>
            </>
        );
    } else {
        return (
            <ListItemButton
                selected={selectedAttribute === attributeId}
                onClick={handlers.displayAttributeSQL(attributeId)}
                sx={{
                    'px': 1,
                    'borderBottom': (theme) =>
                        defaultOutline[theme.palette.mode],
                    '&.Mui-selected': {
                        boxShadow: (theme) =>
                            `inset 0px 0px 0px 1px ${theme.palette.primary.main}`,
                    },
                }}
            >
                <ListItemText
                    primary={itemLabel}
                    sx={{
                        '& .MuiListItemText-primary': {
                            whiteSpace: 'nowrap',
                        },
                    }}
                />
            </ListItemButton>
        );
    }
}

export default CatalogListItem;
