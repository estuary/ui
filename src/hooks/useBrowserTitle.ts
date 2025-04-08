import { useEffect } from 'react';

import { useIntl } from 'react-intl';

import { useUpdateHelmet } from 'src/context/UpdateHelmet';

interface MetaSettings {
    descriptionKey?: string;
    ogTitleKey?: string;
}

function useBrowserTitle(
    titleKey: string,
    prefixKey?: string,
    metaSettings?: MetaSettings
) {
    const intl = useIntl();

    const { updateDescription, updateOgTitle, updateTitle } = useUpdateHelmet();

    useEffect(() => {
        const newTitle = `${intl.formatMessage({
            id: prefixKey ?? 'common.browserTitle',
        })} | ${intl.formatMessage({
            id: titleKey,
        })}`;

        updateTitle(newTitle);

        // We do not have any pass in an og:title today
        //  but added it anyway just in case we need it
        updateOgTitle(
            metaSettings?.ogTitleKey
                ? `${intl.formatMessage({
                      id: metaSettings.ogTitleKey,
                  })}`
                : newTitle
        );

        updateDescription(
            `${intl.formatMessage({
                id:
                    metaSettings?.descriptionKey ??
                    'routeTitle.login.description',
            })}`
        );
    }, [
        intl,
        metaSettings?.ogTitleKey,
        metaSettings?.descriptionKey,
        prefixKey,
        titleKey,
        updateDescription,
        updateOgTitle,
        updateTitle,
    ]);
}

export default useBrowserTitle;
