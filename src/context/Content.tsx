import type { BaseComponentProps } from 'types';
import enUSMessages from 'lang/en-US';
import { IntlProvider } from 'react-intl';
import { MISSING } from 'services/logrocket';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';

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
