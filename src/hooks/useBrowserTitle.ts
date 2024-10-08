import { useUpdateHelmet } from 'context/UpdateHelmet';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';

interface MetaSettings {
    ogDescriptionKey?: string;
    metaTitleKey?: string;
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
        const newMetaTitle = metaSettings?.metaTitleKey
            ? `${intl.formatMessage({
                  id: metaSettings.metaTitleKey,
              })}`
            : undefined;

        const newTitle = `${intl.formatMessage({
            id: prefixKey ?? 'common.browserTitle',
        })} | ${intl.formatMessage({
            id: titleKey,
        })}`;

        updateTitle(newTitle);
        updateOgTitle(newMetaTitle);
        updateOgDescription(
            `${intl.formatMessage({
                id:
                    metaSettings?.ogDescriptionKey ??
                    'routeTitle.default.description',
            })}`
        );
    }, [
        intl,
        metaSettings?.metaTitleKey,
        metaSettings?.ogDescriptionKey,
        prefixKey,
        titleKey,
        updateOgDescription,
        updateOgTitle,
        updateTitle,
    ]);
}

export default useBrowserTitle;
