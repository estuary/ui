import type { BaseProps } from 'src/components/fieldSelection/types';

import { useState } from 'react';

import { Button, Divider, Menu, Tooltip } from '@mui/material';

import { NavArrowDown } from 'iconoir-react';
import { useIntl } from 'react-intl';

import MenuActions from 'src/components/fieldSelection/FieldActions/AlgorithmMenu/MenuActions';
import MenuHeader from 'src/components/fieldSelection/FieldActions/AlgorithmMenu/MenuHeader';
import MenuOptions from 'src/components/fieldSelection/FieldActions/AlgorithmMenu/MenuOptions';
import {
    defaultOutline,
    paperBackground,
    paperBackgroundImage,
} from 'src/context/Theme';
import { useBinding_resourceConfigOfMetaBindingProperty } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';

const AlgorithmMenu = ({ bindingUUID, loading, selections }: BaseProps) => {
    const intl = useIntl();

    const setSelectionAlgorithm = useBindingStore(
        (state) => state.setSelectionAlgorithm
    );
    const builtBindingIndex = useBinding_resourceConfigOfMetaBindingProperty(
        bindingUUID,
        'builtBindingIndex'
    );
    const validatedBindingIndex =
        useBinding_resourceConfigOfMetaBindingProperty(
            bindingUUID,
            'validatedBindingIndex'
        );

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const closeMenu = () => {
        setAnchorEl(null);
        setSelectionAlgorithm(null);
    };

    const draftSpecAssetsMissing =
        typeof builtBindingIndex !== 'number' ||
        builtBindingIndex < 0 ||
        typeof validatedBindingIndex !== 'number' ||
        validatedBindingIndex < 0;

    return (
        <>
            <Tooltip
                placement="top-start"
                title={
                    draftSpecAssetsMissing
                        ? intl.formatMessage({
                              id: 'fieldSelection.table.empty.message',
                          })
                        : ''
                }
            >
                <span>
                    <Button
                        disabled={loading || draftSpecAssetsMissing}
                        endIcon={
                            <NavArrowDown
                                style={{ fontSize: 14, fontWeight: 500 }}
                            />
                        }
                        onClick={(event) => {
                            event.stopPropagation();
                            setAnchorEl(event.currentTarget);
                        }}
                        size="small"
                        style={{ minWidth: 'fit-content' }}
                        variant="outlined"
                    >
                        {intl.formatMessage({
                            id: 'fieldSelection.cta.selectAlgorithm',
                        })}
                    </Button>
                </span>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                onClose={closeMenu}
                open={openMenu}
                PaperProps={{
                    sx: {
                        filter: 'rgb(50 50 93 / 2%) 0px 2px 5px -1px, rgb(0 0 0 / 5%) 0px 1px 3px -1px',
                        mt: 1.5,
                        overflow: 'visible',
                        bgcolor: (theme) => paperBackground[theme.palette.mode],
                        backgroundImage: (theme) =>
                            paperBackgroundImage[theme.palette.mode],
                        border: (theme) => defaultOutline[theme.palette.mode],
                        borderRadius: 3,
                    },
                }}
                sx={{ '& .MuiMenu-paper': { px: 2, borderRadius: 3 } }}
            >
                <MenuHeader />

                <MenuOptions />

                <Divider style={{ marginTop: 4, marginBottom: 12 }} />

                <MenuActions
                    bindingUUID={bindingUUID}
                    closeMenu={closeMenu}
                    loading={loading}
                    selections={selections}
                />
            </Menu>
        </>
    );
};

export default AlgorithmMenu;
