import type { BaseProps } from 'src/components/fieldSelection/types';

import { useState } from 'react';

import { Button, Divider, Menu } from '@mui/material';

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
import useSourceSetting from 'src/hooks/sourceCapture/useSourceSetting';
import { useBindingStore } from 'src/stores/Binding/Store';

const AlgorithmMenu = ({ bindingUUID, loading, selections }: BaseProps) => {
    const intl = useIntl();

    const { currentSetting: fieldsRecommended } = useSourceSetting<
        boolean | number
    >('fieldsRecommended');

    const setSelectionAlgorithm = useBindingStore(
        (state) => state.setSelectionAlgorithm
    );

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const closeMenu = () => {
        setAnchorEl(null);
        setSelectionAlgorithm(null);
    };

    return (
        <>
            <Button
                disabled={loading}
                endIcon={
                    <NavArrowDown style={{ fontSize: 14, fontWeight: 500 }} />
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
                <MenuHeader fieldsRecommended={fieldsRecommended} />

                <MenuOptions fieldsRecommended={fieldsRecommended} />

                <Divider style={{ marginTop: 4, marginBottom: 12 }} />

                <MenuActions
                    bindingUUID={bindingUUID}
                    closeMenu={closeMenu}
                    fieldsRecommended={fieldsRecommended}
                    loading={loading}
                    selections={selections}
                />
            </Menu>
        </>
    );
};

export default AlgorithmMenu;
