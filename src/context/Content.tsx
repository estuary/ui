import enUSMessages from 'lang/en-US';
import { IntlProvider } from 'react-intl';
import { logRocketConsole } from 'services/shared';
import { BaseComponentProps } from 'types';

// TODO (intl) - Don't hard hardcode to EN
//    When we do we need to pass locale to MUI https://mui.com/guides/localization/
const ContentProvider = ({ children }: BaseComponentProps) => {
    const userLang = navigator.language || 'en-US';

    return (
        <IntlProvider
            defaultLocale="en-US"
            locale={userLang}
            messages={enUSMessages}
            onError={(err) => {
                logRocketConsole('Intl:Translation:KeyMissing', err);
            }}
        >
            {children}
        </IntlProvider>
    );
};

export default ContentProvider;
