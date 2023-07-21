import { Schema } from 'types';

import { useEffect, useMemo, useState } from 'react';

import { every, includes } from 'lodash';

import { useEndpointConfig_serverUpdateRequired } from 'stores/EndpointConfig/hooks';

import { hasLength } from 'utils/misc-utils';

import { Options } from 'types/jsonforms';

import { CLIENT_ID, CLIENT_SECRET } from './shared';

export const useAllRequiredPropCheck = (
    data: any,
    options: Schema | undefined,
    onChangePath: string,
    discriminatorProperty: string
) => {
    // Check if the endpointconfig needs to be entered again
    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();

    // Need to know the list of required fields so we can manually
    //      check them down below
    const requiredFields = useMemo(
        () => (options ? options[Options.oauthFields] : []),
        [options]
    );

    // Store if we have all the fields we need for OAuth
    const [hasAllRequiredProps, setHasAllRequiredProps] = useState(false);

    useEffect(() => {
        const dataKeys = Object.keys(data ?? {});
        const nestedKeys = Object.keys(data?.[onChangePath] ?? {});

        // If there is not update required for endpoint config then we know all the props are there
        const response = !serverUpdateRequired
            ? true
            : every(requiredFields, (field: string) => {
                  // We inject these right before calling server so we know we always have these
                  if (field === CLIENT_ID || field === CLIENT_SECRET) {
                      return true;
                  }

                  // When inside a oneOf/anOf/etc. we need to check we have the discriminator
                  if (
                      discriminatorProperty &&
                      field === discriminatorProperty
                  ) {
                      return true;
                  }

                  // Check if the field is in the main data
                  if (includes(dataKeys, field) && hasLength(data?.[field])) {
                      return true;
                  }

                  // As a last effort check if the field is inside of nested data
                  if (
                      includes(nestedKeys, field) &&
                      hasLength(data?.[onChangePath]?.[field])
                  ) {
                      return true;
                  }

                  // Didn't find anything - return false
                  return false;
              });

        setHasAllRequiredProps(response);
    }, [
        serverUpdateRequired,
        data,
        discriminatorProperty,
        onChangePath,
        requiredFields,
    ]);

    const showAuthenticated = useMemo(
        () =>
            // If there is no server update needed then the section has not been edited
            !serverUpdateRequired ||
            // If there is an update require then make sure all the props are there
            hasAllRequiredProps,
        [hasAllRequiredProps, serverUpdateRequired]
    );

    return {
        showAuthenticated,
        hasAllRequiredProps,
        setHasAllRequiredProps,
    };
};
