import type { AlgorithmMenuProps } from 'src/components/fieldSelection/types';

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

const AlgorithmMenu = ({
    handleClick,
    disabled,
    targetFieldsRecommended,
}: AlgorithmMenuProps) => {
    const intl = useIntl();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const closeMenu = () => {
        setAnchorEl(null);
    };

    const contentId = targetFieldsRecommended
        ? 'fieldsRecommended.cta.selectAlgorithm'
        : 'fieldSelection.cta.selectAlgorithm';

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
                <MenuHeader
                    headerId={contentId}
                    targetFieldsRecommended={targetFieldsRecommended}
                />

                <MenuOptions />

                <Divider style={{ marginTop: 4, marginBottom: 12 }} />

                <MenuActions
                    close={closeMenu}
                    handleClick={handleClick}
                    disabled={disabled}
                />
            </Menu>
        </>
    );
};

export default AlgorithmMenu;
