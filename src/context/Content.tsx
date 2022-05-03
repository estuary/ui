import enUSMessages from 'lang/en-US';
import { IntlProvider } from 'react-intl';
import { BaseComponentProps } from 'types';

// TODO (intl) - Don't hard hardcode to EN
//    When we do we need to pass locale to MUI https://mui.com/guides/localization/
const ContentProvider = ({ children }: BaseComponentProps) => {
    const userLang = navigator.language || 'en-US';

    return (
        <IntlProvider
            messages={enUSMessages}
            locale={userLang}
            defaultLocale="en-US"
        >
            {children}
        </IntlProvider>
    );
};

export default ContentProvider;
