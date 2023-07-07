import { useTheme } from '@mui/material';
import { EChartsOption } from 'echarts';
import navArrowLeftDark from 'images/graph-icons/nav-arrow-left__dark.svg';
import navArrowLeftLight from 'images/graph-icons/nav-arrow-left__light.svg';
import navArrowRightDark from 'images/graph-icons/nav-arrow-right__dark.svg';
import navArrowRightLight from 'images/graph-icons/nav-arrow-right__light.svg';
import { useMemo } from 'react';

const navArrowsLight = [
    `image://${navArrowLeftLight}`,
    `image://${navArrowRightLight}`,
];

const navArrowsDark = [
    `image://${navArrowLeftDark}`,
    `image://${navArrowRightDark}`,
];

function useLegendConfig(seriesConfig?: any): EChartsOption['legend'] {
    const theme = useTheme();
    return useMemo(() => {
        const response: EChartsOption['legend'] = {
            type: 'scroll',
            textStyle: {
                color: theme.palette.text.primary,
                fontWeight: 'normal',
            },
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
            pageTextStyle: {
                color: theme.palette.text.primary,
            },
            pageIcons: {
                horizontal:
                    theme.palette.mode === 'light'
                        ? navArrowsLight
                        : navArrowsDark,
            },
        };

        if (seriesConfig) {
            response.data = seriesConfig.map((config: any) => {
                const name = config.seriesName
                    ? config.seriesName
                    : config.name
                    ? config.name
                    : '_unknown_';

                return {
                    name,
                };
            });
        }

        return response;
    }, [seriesConfig, theme.palette.mode, theme.palette.text.primary]);
}

export default useLegendConfig;
