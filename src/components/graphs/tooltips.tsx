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

export { getTooltipItem, getTooltipTitle };
