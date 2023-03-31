import { useTheme } from '@mui/material';
import darkDemo from 'images/demo_dark.png';
import lightDemo from 'images/demo_light.png';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useHeroTabs } from './hooks';

const lightHero =
    'https://storage.googleapis.com/estuary-marketing-strapi-uploads/uploads//welcome_light_1_72be658eb9/welcome_light_1_72be658eb9.svg?width=771&height=345';

const darkHero =
    'https://storage.googleapis.com/estuary-marketing-strapi-uploads/uploads//welcome_dark_fd66c55902/welcome_dark_fd66c55902.svg?width=771&height=345';

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
            theme.palette.mode === 'light' ? lightHero : darkHero,
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
