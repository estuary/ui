import enUSMessages from 'src/lang/en-US';
import { IntlProvider } from 'react-intl';
import { MISSING } from 'src/services/logrocket';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { BaseComponentProps } from 'src/types';

// TODO (intl) - Don't hard hardcode to EN
//    When we do we need to pass locale to MUI https://mui.com/guides/localization/
const ContentProvider = ({ children }: BaseComponentProps) => {
    const userLang = navigator.language || 'en-US';

    return (
        <IntlProvider
            defaultLocale="en-US"
            locale={userLang}
            messages={enUSMessages}
            onError={(err: any) => {
                logRocketEvent(CustomEvents.TRANSLATION_KEY_MISSING, {
                    key: err?.descriptor?.id ?? err?.message ?? MISSING,
                });
            }}
        >
            {children}
        </IntlProvider>
    );
};

export default ContentProvider;
