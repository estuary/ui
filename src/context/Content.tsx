import enUSMessages from 'lang/en-US';
import { IntlProvider } from 'react-intl';
import { BaseComponentProps } from 'types';

// TODO - Don't hard hardcode to EN
//    When we do we need to pass locale to MUI https://mui.com/guides/localization/
const AppContent = ({ children }: BaseComponentProps) => {
    return (
        <IntlProvider
            messages={enUSMessages}
            locale="en-US"
            defaultLocale="en-US"
        >
            {children}
        </IntlProvider>
    );
};

export default AppContent;
