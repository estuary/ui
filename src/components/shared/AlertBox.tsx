import { Alert, AlertTitle, Typography, useTheme } from '@mui/material';
import { alertBackground, alertTextPrimary } from 'context/Theme';
import {
    CheckCircle,
    InfoCircle,
    WarningCircle,
    XmarkCircle,
} from 'iconoir-react';
import { forwardRef, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { AlertBoxProps } from './types';

const SHARED_STYLING = {
    borderRadius: 2,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
};

const HEADER_MESSAGE = {
    warning: 'alert.warning',
    success: 'alert.success',
    info: 'alert.info',
    error: 'alert.error',
};

const AlertBox = forwardRef<any, AlertBoxProps>(function NavLinkRef(
    { short, severity, hideIcon, title, children, onClose, sx },
    ref
) {
    const theme = useTheme();

    const iconComponentStyling = useMemo(
        () =>
            !short
                ? {
                      color: alertTextPrimary[theme.palette.mode],
                      fontSize: '1em',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                  }
                : undefined,
        [short, theme.palette.mode]
    );

    const header = useMemo(
        () =>
            !short && HEADER_MESSAGE[severity] ? (
                <Typography
                    variant="h4"
                    component="div"
                    sx={{
                        pb: 1,
                    }}
                >
                    <FormattedMessage id={HEADER_MESSAGE[severity]} />
                </Typography>
            ) : null,
        [severity, short]
    );

    const iconProps = hideIcon ? { icon: false } : {};

    return (
        <Alert
            {...iconProps}
            ref={ref}
            severity={severity}
            variant="outlined"
            iconMapping={{
                error: <XmarkCircle style={iconComponentStyling} />,
                warning: <WarningCircle style={iconComponentStyling} />,
                info: <InfoCircle style={iconComponentStyling} />,
                success: <CheckCircle style={iconComponentStyling} />,
            }}
            onClose={onClose}
            sx={{
                ...(sx ?? {}),
                'backgroundColor': alertBackground[theme.palette.mode],
                'color': alertTextPrimary[theme.palette.mode],
                'borderColor': theme.palette[severity][theme.palette.mode],
                'padding': 0,
                'pl': hideIcon ? 2 : undefined,
                '& > .MuiAlert-message': {
                    p: 1,
                    pl: 0,
                    width: '100%',
                },
                '& > .MuiAlert-action': short
                    ? {
                          margin: 0,
                          padding: 1,
                          paddingTop: 0.5,
                          alignItems: 'center',
                      }
                    : {
                          margin: 0,
                          padding: 1,
                      },
                '& > .MuiAlert-icon': short
                    ? {
                          ...SHARED_STYLING,
                          borderLeftColor:
                              theme.palette[severity][theme.palette.mode],
                          color: alertTextPrimary[theme.palette.mode],
                          mr: 0,
                          px: 1,
                          borderLeftStyle: 'solid',
                          borderLeftWidth: 15,
                      }
                    : {
                          ...SHARED_STYLING,
                          background:
                              theme.palette[severity][theme.palette.mode],
                          px: 3,
                          pt: 2,
                      },
            }}
        >
            {header}
            {title ? <AlertTitle>{title}</AlertTitle> : null}
            {children}
        </Alert>
    );
});

export default AlertBox;
