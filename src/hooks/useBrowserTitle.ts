import { useUpdateHelmet } from 'context/UpdateHelmet';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';

interface MetaSettings {
    ogDescriptionKey?: string;
    ogTitleKey?: string;
}

function useBrowserTitle(
    titleKey: string,
    prefixKey?: string,
    metaSettings?: MetaSettings
) {
    const intl = useIntl();

    const { updateOgDescription, updateOgTitle, updateTitle } =
        useUpdateHelmet();

    useEffect(() => {
        updateTitle(
            `${intl.formatMessage({
                id: prefixKey ?? 'common.browserTitle',
            })} | ${intl.formatMessage({
                id: titleKey,
            })}`
        );

        updateOgTitle(
            metaSettings?.ogTitleKey
                ? `${intl.formatMessage({
                      id: metaSettings.ogTitleKey,
                  })}`
                : undefined
        );

        updateOgDescription(
            `${intl.formatMessage({
                id:
                    metaSettings?.ogDescriptionKey ??
                    'routeTitle.default.ogDescription',
            })}`
        );
    }, [
        intl,
        metaSettings?.ogTitleKey,
        metaSettings?.ogDescriptionKey,
        prefixKey,
        titleKey,
        updateOgDescription,
        updateOgTitle,
        updateTitle,
    ]);
}

export default useBrowserTitle;
