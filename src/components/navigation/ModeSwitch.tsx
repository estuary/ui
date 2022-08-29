import ModeNightIcon from '@mui/icons-material/ModeNight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { Button, IconButton, Tooltip, useTheme } from '@mui/material';
import { useColorMode } from 'context/Theme';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    hideText: boolean;
}

function ModeSwitch({ hideText }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const colorMode = useColorMode();

    return (
        <Tooltip
            title={intl.formatMessage({
                id: 'modeSwitch.label',
            })}
            placement="right-end"
        >
            {hideText ? (
                <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
                    {theme.palette.mode === 'dark' ? (
                        <ModeNightIcon />
                    ) : (
                        <WbSunnyIcon />
                    )}
                </IconButton>
            ) : (
                <Button
                    color="inherit"
                    variant="text"
                    onClick={colorMode.toggleColorMode}
                    startIcon={
                        theme.palette.mode === 'dark' ? (
                            <ModeNightIcon />
                        ) : (
                            <WbSunnyIcon />
                        )
                    }
                    sx={{
                        whiteSpace: 'nowrap',
                    }}
                >
                    <FormattedMessage id="modeSwitch.label" />
                </Button>
            )}
        </Tooltip>
    );
}

export default ModeSwitch;
