import { Button, Divider, Menu } from '@mui/material';
import { NavArrowDown } from 'iconoir-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import MenuActions from './MenuActions';
import MenuOptions from './MenuOptions';
import { BaseProps } from './types';

export default function FieldActions({
    bindingUUID,
    loading,
    projections,
}: BaseProps) {
    const intl = useIntl();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const closeMenu = () => {
        setAnchorEl(null);
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
                sx={{ '& .MuiMenu-paper': { px: 2, borderRadius: 3 } }}
            >
                <MenuOptions />

                <Divider style={{ marginTop: 4, marginBottom: 12 }} />

                <MenuActions
                    bindingUUID={bindingUUID}
                    closeMenu={closeMenu}
                    loading={loading}
                    projections={projections}
                />
            </Menu>
        </>
    );
}
