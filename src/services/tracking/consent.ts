import ConsentManager, { GrantsInterface } from 'consent-manager';

const consentManager = new ConsentManager({
    // Version of the current configuration
    // When this changes all current consent preferences will be disregarded
    // string - required
    version: '2022-10-01',

    // Name of the cookie containing preferences
    // string - optional - defaults to "consent-manager"
    cookieName: 'consent-manager',

    // How long until cookie containing preferences expires
    // number (days), Date object or "session" (until end of session) - optional - defaults to 365 days
    expires: 365,

    // Array of all toggleable categories by which cookies will be sorted; adjust to according to your needs
    categories: [
        {
            // Unique identifier
            // string - required
            id: 'essential',

            // Human understandable label
            // string - required
            label: 'Essential Cookies',

            // Explanation of category's purpose
            // string - required
            description: 'Required for basic functionality',

            // If required a category cannot be disabled
            // boolean - required
            required: true,
        },
        {
            // Unique identifier
            // string - required
            id: 'analytics',

            // Human understandable label
            // string - required
            label: 'Analytics Cookies',
            description: 'Visitor statistics used to improve content',

            // If required a category cannot be disabled
            // boolean - required
            required: false,

            // Default value of category
            // boolean - optional - defaults to false
            default: true,
        },
    ],
});

const grantsInterface = new GrantsInterface(consentManager, {
    autoShow: false,
});

const useGrantsInterface = () => {
    return grantsInterface;
};

export { consentManager, grantsInterface, useGrantsInterface };
