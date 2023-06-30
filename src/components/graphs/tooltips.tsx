import { SxProps, Theme } from '@mui/material';

const VALUE_CLASS = 'tooltipDataValue';
const ITEM_CLASS = 'tooltipItem';
const TITLE_CLASS = 'tooltipTitle';

const getTooltipItem = (marker: any, label: any, value: any) => {
    return `<div class="${ITEM_CLASS}">
                <div>
                    ${marker}
                    <span>${label}</span>
                </div>
                <span class="${VALUE_CLASS}">${value}</span>
            </div>`;
};

const getTooltipTitle = (title: any) => {
    return `<div class="${TITLE_CLASS}">${title}</div>`;
};

const tooltipSX: SxProps<Theme> = {
    [`& .${TITLE_CLASS}`]: {
        marginBottom: '0.5rem',
    },
    [`& .${ITEM_CLASS}`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.25rem',
    },
    [`& .${VALUE_CLASS}`]: {
        marginLeft: '20px',
        fontWeight: 600,
        textTransform: 'capitalize',
    },
};

export { getTooltipItem, getTooltipTitle, tooltipSX };
