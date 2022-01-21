import enUS from 'lang/en-US.json';
import { IntlProvider, ResolvedIntlConfig } from 'react-intl';

// TODO - Don't hard hardcode to EN
//    When we do we need to pass locale to MUI https://mui.com/guides/localization/
const AppContent: React.FC = ({ children }) => {
    return (
        <IntlProvider
            messages={enUS as ResolvedIntlConfig['messages']}
            locale="en-US"
            defaultLocale="en-US"
        >
            {children}
        </IntlProvider>
    );
};

export default AppContent;
