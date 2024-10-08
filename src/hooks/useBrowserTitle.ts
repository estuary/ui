import { useUpdateHelmet } from 'context/UpdateHelmet';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';

interface MetaSettings {
    descriptionKey?: string;
    metaTitleKey?: string;
}

function useBrowserTitle(
    titleKey: string,
    prefixKey?: string,
    metaSettings?: MetaSettings
) {
    const intl = useIntl();

    const { updateDescription, updateMetaTitle, updateTitle } =
        useUpdateHelmet();

    useEffect(() => {
        console.log('useBrowserTitle', titleKey);

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
        updateMetaTitle(newMetaTitle);
        updateDescription(
            `${intl.formatMessage({
                id:
                    metaSettings?.descriptionKey ??
                    'routeTitle.default.description',
            })}`
        );
    }, [
        intl,
        metaSettings?.descriptionKey,
        metaSettings?.metaTitleKey,
        prefixKey,
        titleKey,
        updateDescription,
        updateMetaTitle,
        updateTitle,
    ]);
}

export default useBrowserTitle;
