import type { AlgorithmMenuProps } from 'src/components/fieldSelection/types';
import type { SelectionAlgorithm } from 'src/stores/Binding/slices/FieldSelection';

import { useEffect, useState } from 'react';

import { Button, Divider, Menu } from '@mui/material';

import { NavArrowDown } from 'iconoir-react';
import { useIntl } from 'react-intl';

import MenuActions from 'src/components/fieldSelection/FieldActions/AlgorithmMenu/MenuActions';
import MenuOptions from 'src/components/fieldSelection/FieldActions/AlgorithmMenu/MenuOptions';
import {
    defaultOutline,
    paperBackground,
    paperBackgroundImage,
} from 'src/context/Theme';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { mapRecommendedValueToAlgorithm } from 'src/utils/fieldSelection-utils';

const AlgorithmMenu = ({
    bindingUUID,
    disabled,
    handleClick,
    targetFieldsRecommended,
}: AlgorithmMenuProps) => {
    const intl = useIntl();

    const bindingRecommendedFlag = useBindingStore((state) =>
        bindingUUID ? state.recommendFields?.[bindingUUID] : undefined
    );

    const fieldsRecommended = useSourceCaptureStore(
        (state) => state.fieldsRecommended
    );

    const [selectionAlgorithm, setSelectionAlgorithm] =
        useState<SelectionAlgorithm | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const isOpen = Boolean(anchorEl);
    const closeMenu = () => {
        setAnchorEl(null);
    };

    const contentId = targetFieldsRecommended
        ? 'fieldsRecommended.cta.selectAlgorithm'
        : 'fieldSelection.cta.selectAlgorithm';

    useEffect(() => {
        if (isOpen) {
            const targetAlgorithm = mapRecommendedValueToAlgorithm(
                targetFieldsRecommended
                    ? fieldsRecommended
                    : bindingRecommendedFlag
            );

            setSelectionAlgorithm(targetAlgorithm);
        }
    }, [
        bindingRecommendedFlag,
        fieldsRecommended,
        isOpen,
        setSelectionAlgorithm,
        targetFieldsRecommended,
    ]);

    return (
        <>
            <Button
                disabled={disabled}
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
                    id: contentId,
                })}
            </Button>

            <Menu
                anchorEl={anchorEl}
                onClose={closeMenu}
                open={isOpen}
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
                <MenuOptions
                    selectionAlgorithm={selectionAlgorithm}
                    setSelectionAlgorithm={setSelectionAlgorithm}
                />

                <Divider style={{ marginTop: 4, marginBottom: 12 }} />

                <MenuActions
                    close={closeMenu}
                    disabled={disabled}
                    handleClick={handleClick}
                    selectionAlgorithm={selectionAlgorithm}
                />
            </Menu>
        </>
    );
};

export default AlgorithmMenu;
