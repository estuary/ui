import {
    Collapse,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    useTheme,
} from '@mui/material';
import {
    useEditorStore_invalidEditors,
    useEditorStore_removeStaleStatus,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import { defaultOutline } from 'context/Theme';
import {
    Cancel,
    NavArrowDown,
    NavArrowRight,
    WarningCircle,
} from 'iconoir-react';
import { useMemo, useState } from 'react';
import {
    useTransformationCreate_removeAttribute,
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
    const theme = useTheme();

    // Draft Editor Store
    const setDraftId = useEditorStore_setId();
    const invalidEditors = useEditorStore_invalidEditors();
    const removeStaleEditorStatus = useEditorStore_removeStaleStatus();

    // Transformation Create Store
    const selectedAttribute = useTransformationCreate_selectedAttribute();
    const setSelectedAttribute = useTransformationCreate_setSelectedAttribute();
    const setAttributeType = useTransformationCreate_setAttributeType();
    const removeAttribute = useTransformationCreate_removeAttribute();

    const [open, setOpen] = useState<boolean>(true);

    const editorInvalid = useMemo(
        () => invalidEditors.includes(attributeId),
        [invalidEditors, attributeId]
    );

    const handlers = {
        toggleList: () => {
            setOpen(!open);
        },
        displayAttributeSQL: (id: string) => () => {
            setAttributeType(fixedAttributeType);
            setSelectedAttribute(id);
        },
        removeListItem: (
            event: React.MouseEvent<HTMLButtonElement, MouseEvent>
        ) => {
            event.stopPropagation();
            event.preventDefault();

            removeAttribute(attributeId);
            removeStaleEditorStatus(attributeId);
            setDraftId(null);
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
                        'borderBottom': open
                            ? 'none'
                            : defaultOutline[theme.palette.mode],
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
                        borderBottom: defaultOutline[theme.palette.mode],
                    }}
                >
                    <List component="div" disablePadding>
                        <ListItemButton
                            dense
                            selected={selectedAttribute === attributeId}
                            onClick={handlers.displayAttributeSQL(attributeId)}
                            sx={{
                                'pl': 5,
                                '&.MuiButtonBase-root:hover::after': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                                '&.Mui-selected': {
                                    boxShadow: `inset 0px 0px 0px 1px ${theme.palette.primary.main}`,
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
            <Stack
                direction="row"
                sx={{
                    borderBottom: defaultOutline[theme.palette.mode],
                }}
            >
                <ListItemButton
                    selected={selectedAttribute === attributeId}
                    onClick={handlers.displayAttributeSQL(attributeId)}
                    sx={{
                        'px': 1,
                        '&.MuiButtonBase-root:hover::after': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                        '&.Mui-selected': {
                            boxShadow: `inset 0px 0px 0px 1px ${theme.palette.primary.main}`,
                        },
                    }}
                >
                    {editorInvalid ? (
                        <WarningCircle
                            style={{
                                marginRight: 4,
                                fontSize: 12,
                                color: theme.palette.warning[
                                    theme.palette.mode
                                ],
                            }}
                        />
                    ) : null}

                    <ListItemText
                        primary={itemLabel}
                        sx={{
                            '& .MuiListItemText-primary': {
                                whiteSpace: 'nowrap',
                            },
                        }}
                    />

                    <IconButton
                        onClick={handlers.removeListItem}
                        sx={{ zIndex: 40 }}
                    >
                        <Cancel />
                    </IconButton>
                </ListItemButton>
            </Stack>
        );
    }
}

export default CatalogListItem;
