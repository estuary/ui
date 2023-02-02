import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import {
    Alert,
    AlertColor,
    AlertTitle,
    Theme,
    Typography,
} from '@mui/material';
import { alertBackground, alertTextPrimary } from 'context/Theme';
import { forwardRef, ReactNode, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    severity: AlertColor;
    short?: boolean;
    hideIcon?: boolean;
    title?: string | ReactNode;
    onClose?: () => void;
}

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

const AlertBox = forwardRef<any, Props>(function NavLinkRef(
    { short, severity, hideIcon, title, children, onClose },
    ref
) {
    const iconComponentStyling = useMemo(
        () =>
            !short
                ? {
                      color: (theme: Theme) =>
                          alertTextPrimary[theme.palette.mode],
                      fontSize: '2em',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                  }
                : undefined,
        [short]
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

    return (
        <Alert
            ref={ref}
            severity={severity}
            variant="outlined"
            icon={hideIcon ?? undefined}
            iconMapping={{
                error: <DangerousOutlinedIcon sx={iconComponentStyling} />,
                warning: (
                    <ReportProblemOutlinedIcon sx={iconComponentStyling} />
                ),
                info: <InfoOutlinedIcon sx={iconComponentStyling} />,
                success: <TaskAltOutlinedIcon sx={iconComponentStyling} />,
            }}
            onClose={onClose}
            sx={{
                'backgroundColor': (theme) =>
                    alertBackground[theme.palette.mode],
                'color': (theme) => alertTextPrimary[theme.palette.mode],
                'borderColor': (theme) =>
                    theme.palette[severity][theme.palette.mode],
                'padding': 0,
                '& > .MuiAlert-message': {
                    p: 1,
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
                          borderLeftColor: (theme) =>
                              theme.palette[severity][theme.palette.mode],
                          color: (theme) =>
                              theme.palette[severity][theme.palette.mode],
                          mr: 0,
                          px: 1,
                          borderLeftStyle: 'solid',
                          borderLeftWidth: 15,
                      }
                    : {
                          ...SHARED_STYLING,
                          background: (theme) =>
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
