import type { User } from '@supabase/supabase-js';

import posthog from 'posthog-js';

import { getUserDetails } from 'src/services/shared';
import { getPostHogSettings } from 'src/utils/env-utils';

const postHogSettings = getPostHogSettings();

export const posthogCapture = (event: string, data?: any) => {
    if (!postHogSettings) {
        return;
    }

    return posthog.capture(event, {
        est_event_data: data ?? {},
    });
};

export const posthogIdentify = (user: User) => {
    if (!postHogSettings || !postHogSettings?.idUser) {
        return;
    }
    const userDetails = getUserDetails(user);

    if (!userDetails || posthog._isIdentified()) {
        return;
    }

    const { id, email, emailVerified, userName, usedSSO } = userDetails;
    return posthog.identify(id, {
        lastLogin: new Date(),
        email,
        emailVerified,
        userName,
        usedSSO,
    });
};
