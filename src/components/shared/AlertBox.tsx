import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import { Alert, AlertColor, AlertTitle, Typography } from '@mui/material';
import { alertTextPrimary } from 'context/Theme';
import { ReactNode, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    severity: AlertColor;
    short?: boolean;
    hideIcon?: boolean;
    title?: string | ReactNode;
}

const SHORT_ICON_STYLING = {
    color: 'white',
};

const ICON_STYLING = {
    ...SHORT_ICON_STYLING,
    fontSize: '2.5em',
    marginLeft: 'auto',
    marginRight: 'auto',
};

const SHARED_STYLING = {
    borderRadius: 4,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
};

const HEADER_MESSAGE = {
    warning: 'alert.warning',
    success: 'alert.success',
    info: 'alert.info',
    error: 'alert.error',
};

function AlertBox({ short, severity, hideIcon, title, children }: Props) {
    const iconComponentStyling = useMemo(
        () => (!short ? ICON_STYLING : undefined),
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
            sx={{
                'color': (theme) => alertTextPrimary[theme.palette.mode],
                'padding': 0,
                '& > .MuiAlert-message': {
                    p: 1,
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
}

export default AlertBox;
