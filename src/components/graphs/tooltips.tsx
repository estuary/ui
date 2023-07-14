import { SxProps, Theme } from '@mui/material';

const VALUE_CLASS = 'tooltipDataValue';
const ITEM_CLASS = 'tooltipItem';
const TITLE_CLASS = 'tooltipTitle';

const getTooltipItem = (marker: string, label: string, value?: string) => {
    console.log('getTooltipItem', {
        marker,
        label,
        value,
    });
    return `<div class="${ITEM_CLASS}">
                <div>
                    ${marker}
                    <span>${label}</span>
                </div>
                ${value ? `<span class="${VALUE_CLASS}">${value}</span>` : ``}
            </div>`;
};

const getTooltipTitle = (title: any) => {
    return `<div class="${TITLE_CLASS}">${title}</div>`;
};

const eChartsTooltipSX: SxProps<Theme> = {
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

export { getTooltipItem, getTooltipTitle, eChartsTooltipSX };
