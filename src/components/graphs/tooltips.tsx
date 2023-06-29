import { SxProps, Theme } from '@mui/material';

const getTooltipItem = (marker: any, label: any, value: any) => {
    return `<div class="tooltipItem">
                <div>
                    ${marker}
                    <span>${label}</span>
                </div>
                <span class="tooltipDataValue">${value}</span>
            </div>`;
};

const getTooltipTitle = (title: any) => {
    return `<div class="tooltipTitle">${title}</div>`;
};

const tooltipSX: SxProps<Theme> = {
    '& .tooltipTitle': {
        marginBottom: '0.5rem',
    },
    '& .tooltipItem': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.25rem',
    },
    '& .tooltipDataValue': {
        marginLeft: '20px',
        fontWeight: 600,
    },
};

export { getTooltipItem, getTooltipTitle, tooltipSX };
