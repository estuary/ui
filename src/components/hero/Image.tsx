import { useTheme } from '@mui/material';
import darkDemo from 'images/demo_dark.png';
import lightDemo from 'images/demo_light.png';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useHeroTabs } from './hooks';

// TODO (hero image) would be nice to make the image change height/width
//  smoothly when the images change
function HeroImage() {
    const intl = useIntl();
    const theme = useTheme();
    const { activeTab } = useHeroTabs();

    const [src, alt] = useMemo(() => {
        if (activeTab === 'demo') {
            return [
                theme.palette.mode === 'light' ? lightDemo : darkDemo,
                'welcome.demo.alt',
            ];
        }

        return [
            `https://www.estuary.dev/wp-content/uploads/2023/02/welcome_${theme.palette.mode}.png`,
            'welcome.image.alt',
        ];
    }, [activeTab, theme.palette.mode]);

    return (
        <img
            src={src}
            style={{
                marginBottom: 16,
            }}
            width="75%"
            alt={intl.formatMessage({ id: alt })}
        />
    );
}

export default HeroImage;
