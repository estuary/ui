// Tried our best to pick flags that make sense for users. Did not use state, provincial, etc. flags
//  to keep this simpler. The flags were chosen by finding the country on wikipedia's list:
//      https://en.wikipedia.org/wiki/Regional_indicator_symbol

const defaultResponse = {
    location: `unknown`,
    flag: `?`,
};

// from https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html
const aws = {
    'us-east-1': {
        location: `US East (N. Virginia), United States of America`,
        flag: `🇺🇸`,
    },
    'us-east-2': {
        location: `US East (Ohio), United States of America`,
        flag: `🇺🇸`,
    },
    'us-west-1': {
        location: `US West (N. California), United States of America`,
        flag: `🇺🇸`,
    },
    'us-west-2': {
        location: `US West (Oregon), United States of America`,
        flag: `🇺🇸`,
    },
    'af-south-1': {
        location: `Africa (Cape Town), South Africa`,
        flag: `🇿🇦`,
    },
    'ap-east-1': {
        location: `Asia Pacific (Hong Kong), Hong Kong`,
        flag: `🇭🇰`,
    },
    'ap-south-2': {
        location: `Asia Pacific (Hyderabad), India`,
        flag: `🇮🇳`,
    },
    'ap-southeast-3': {
        location: `Asia Pacific (Jakarta), Indonesia`,
        flag: `🇮🇩`,
    },
    'ap-southeast-5': {
        location: `Asia Pacific (Malaysia), Malaysia`,
        flag: `🇲🇾`,
    },
    'ap-southeast-4': {
        location: `Asia Pacific (Melbourne), Australia`,
        flag: `🇦🇺`,
    },
    'ap-south-1': { location: `Asia Pacific (Mumbai), India`, flag: `🇮🇳` },
    'ap-northeast-3': { location: `Asia Pacific (Osaka), Japan`, flag: `🇯🇵` },
    'ap-northeast-2': {
        location: `Asia Pacific (Seoul), South Korea`,
        flag: `🇰🇷`,
    },
    'ap-southeast-1': {
        location: `Asia Pacific (Singapore), Singapore`,
        flag: `🇸🇬`,
    },
    'ap-southeast-2': {
        location: `Asia Pacific (Sydney), Australia`,
        flag: `🇦🇺`,
    },
    'ap-southeast-7': {
        location: `Asia Pacific (Thailand), Thailand`,
        flag: `🇹🇭`,
    },
    'ap-northeast-1': { location: `Asia Pacific (Tokyo), Japan`, flag: `🇯🇵` },
    'ca-central-1': { location: `Canada (Central), Canada`, flag: `🇨🇦` },
    'ca-west-1': { location: `Canada West (Calgary), Canada`, flag: `🇨🇦` },
    'eu-central-1': { location: `Europe (Frankfurt), Germany`, flag: `🇩🇪` },
    'eu-west-1': { location: `Europe (Ireland), Ireland`, flag: `🇮🇪` },
    'eu-west-2': { location: `Europe (London), United Kingdom`, flag: `🇬🇧` },
    'eu-south-1': { location: `Europe (Milan), Italy`, flag: `🇮🇹` },
    'eu-west-3': { location: `Europe (Paris), France`, flag: `🇫🇷` },
    'eu-south-2': { location: `Europe (Spain), Spain`, flag: `🇪🇸` },
    'eu-north-1': { location: `Europe (Stockholm), Sweden`, flag: `🇸🇪` },
    'eu-central-2': { location: `Europe (Zurich), Switzerland`, flag: `🇨🇭` },
    'il-central-1': { location: `Israel (Tel Aviv), Israel`, flag: `🇮🇱` },
    'mx-central-1': { location: `Mexico (Central), Mexico`, flag: `🇲🇽` },
    'me-south-1': { location: `Middle East (Bahrain), Bahrain`, flag: `🇧🇭` },
    'me-central-1': {
        location: `Middle East (UAE), United Arab Emirates`,
        flag: `🇦🇪`,
    },
    'sa-east-1': { location: `South America (São Paulo), Brazil`, flag: `🇧🇷` },
};

// from https://gist.github.com/ausfestivus/04e55c7d80229069bf3bc75870630ec8
const azure = {
    southafricanorth: { location: `(Africa) South Africa North`, flag: `🇿🇦` },
    southafricawest: { location: `(Africa) South Africa West`, flag: `🇿🇦` },
    australiacentral: {
        location: `(Asia Pacific) Australia Central`,
        flag: `🇦🇺`,
    },
    australiacentral2: {
        location: `(Asia Pacific) Australia Central 2`,
        flag: `🇦🇺`,
    },
    australiaeast: { location: `(Asia Pacific) Australia East`, flag: `🇦🇺` },
    australiasoutheast: {
        location: `(Asia Pacific) Australia Southeast`,
        flag: `🇦🇺`,
    },
    centralindia: { location: `(Asia Pacific) Central India`, flag: `🇮🇳` },
    // 'eastasia': {location:`(Asia Pacific) East Asia`, flag:`?`},
    japaneast: { location: `(Asia Pacific) Japan East`, flag: `🇯🇵` },
    japanwest: { location: `(Asia Pacific) Japan West`, flag: `🇯🇵` },
    jioindiacentral: {
        location: `(Asia Pacific) Jio India Central`,
        flag: `🇮🇳`,
    },
    jioindiawest: { location: `(Asia Pacific) Jio India West`, flag: `🇮🇳` },
    koreacentral: { location: `(Asia Pacific) Korea Central`, flag: `🇮🇳` },
    koreasouth: { location: `(Asia Pacific) Korea South`, flag: `🇰🇷` },
    southindia: { location: `(Asia Pacific) South India`, flag: `🇮🇳` },
    // 'southeastasia': {location:`(Asia Pacific) Southeast Asia`, flag:`?`},
    westindia: { location: `(Asia Pacific) West India`, flag: `🇮🇳` },
    canadacentral: { location: `(Canada) Canada Central`, flag: `🇨🇦` },
    canadaeast: { location: `(Canada) Canada East`, flag: `🇨🇦` },
    francecentral: { location: `(Europe) France Central`, flag: `🇫🇷` },
    francesouth: { location: `(Europe) France South`, flag: `🇫🇷` },
    germanynorth: { location: `(Europe) Germany North`, flag: `🇩🇪` },
    germanywestcentral: {
        location: `(Europe) Germany West Central`,
        flag: `🇩🇪`,
    },
    italynorth: { location: `(Europe) Italy North`, flag: `🇮🇹` },
    northeurope: { location: `(Europe) North Europe`, flag: `🇪🇺` },
    norwayeast: { location: `(Europe) Norway East`, flag: `🇳🇴` },
    norwaywest: { location: `(Europe) Norway West`, flag: `🇳🇴` },
    polandcentral: { location: `(Europe) Poland Central`, flag: `🇵🇱` },
    spaincentral: { location: `(Europe) Spain Central`, flag: `🇪🇸` },
    swedencentral: { location: `(Europe) Sweden Central`, flag: `🇸🇪` },
    switzerlandnorth: { location: `(Europe) Switzerland North`, flag: `🇨🇭` },
    switzerlandwest: { location: `(Europe) Switzerland West`, flag: `🇨🇭` },
    uksouth: { location: `(Europe) UK South`, flag: `🇬🇧` },
    ukwest: { location: `(Europe) UK West`, flag: `🇬🇧` },
    westeurope: { location: `(Europe) West Europe`, flag: `🇪🇺` },
    mexicocentral: { location: `(Mexico) Mexico Central`, flag: `🇲🇽` },
    israelcentral: { location: `(Middle East) Israel Central`, flag: `🇮🇱` },
    qatarcentral: { location: `(Middle East) Qatar Central`, flag: `🇶🇦` },
    uaecentral: { location: `(Middle East) UAE Central`, flag: `🇦🇪` },
    uaenorth: { location: `(Middle East) UAE North`, flag: `🇦🇪` },
    brazilsouth: { location: `(South America) Brazil South`, flag: `🇧🇷` },
    brazilsoutheast: {
        location: `(South America) Brazil Southeast`,
        flag: `🇧🇷`,
    },
    brazilus: { location: `(South America) Brazil US`, flag: `🇧🇷` },
    centralus: { location: `(US) Central US`, flag: `🇺🇸` },
    centraluseuap: { location: `(US) Central US EUAP`, flag: `🇺🇸` },
    eastus: { location: `(US) East US`, flag: `🇺🇸` },
    eastus2: { location: `(US) East US 2`, flag: `🇺🇸` },
    eastus2euap: { location: `(US) East US 2 EUAP`, flag: `🇺🇸` },
    eastusstg: { location: `(US) East US STG`, flag: `🇺🇸` },
    northcentralus: { location: `(US) North Central US`, flag: `🇺🇸` },
    southcentralus: { location: `(US) South Central US`, flag: `🇺🇸` },
    southcentralusstg: { location: `(US) South Central US STG`, flag: `🇺🇸` },
    westcentralus: { location: `(US) West Central US`, flag: `🇺🇸` },
    westus: { location: `(US) West US`, flag: `🇺🇸` },
    westus2: { location: `(US) West US 2`, flag: `🇺🇸` },
    westus3: { location: `(US) West US 3`, flag: `🇺🇸` },
};

// from https://cloud.google.com/compute/docs/regions-zones#available
const gcp = {
    'africa-south1': { location: `Johannesburg, South Africa`, flag: `🇿🇦` },
    'asia-east1': { location: `Changhua County, Taiwan, APAC`, flag: `🇹🇼` },
    'asia-east2': { location: `Hong Kong, APAC`, flag: `🇭🇰` },
    'asia-northeast1': { location: `Tokyo, Japan, APAC`, flag: `🇯🇵` },
    'asia-northeast2': { location: `Osaka, Japan, APAC`, flag: `🇯🇵` },
    'asia-northeast3': { location: `Seoul, South Korea, APAC`, flag: `🇰🇷` },
    'asia-south1': { location: `Mumbai, India, APAC`, flag: `🇮🇳` },
    'asia-south2': { location: `Delhi, India, APAC`, flag: `🇮🇳` },
    'asia-southeast1': {
        location: `Jurong West, Singapore, APAC`,
        flag: `🇸🇬`,
    },
    'asia-southeast2': { location: `Jakarta, Indonesia, APAC`, flag: `🇮🇩` },
    'australia-southeast1': { location: `Sydney, Australia, APAC`, flag: `🇦🇺` },
    'australia-southeast2': {
        location: `Melbourne, Australia, APAC`,
        flag: `🇦🇺`,
    },
    'europe-central2': { location: `Warsaw, Poland, Europe`, flag: `🇵🇱` },
    'europe-north1': { location: `Hamina, Finland, Europe`, flag: `🇫🇮` },
    'europe-north2': { location: `Stockholm, Sweden, Europe`, flag: `🇸🇪` },
    'europe-southwest1': { location: `Madrid, Spain, Europe`, flag: `🇪🇸` },
    'europe-west1': { location: `St. Ghislain, Belgium, Europe`, flag: `🇧🇪` },
    'europe-west10': { location: `Berlin, Germany, Europe`, flag: `🇩🇪` },
    'europe-west12': { location: `Turin, Italy, Europe`, flag: `🇮🇹` },
    'europe-west2': { location: `London, England, Europe`, flag: `🇬🇧` },
    'europe-west3': { location: `Frankfurt, Germany, Europe`, flag: `🇩🇪` },
    'europe-west4': { location: `Eemshaven, Netherlands, Europe`, flag: `🇳🇱` },
    'europe-west6': { location: `Zurich, Switzerland, Europe`, flag: `🇨🇭` },
    'europe-west8': { location: `Milan, Italy, Europe`, flag: `🇮🇹` },
    'europe-west9': { location: `Paris, France, Europe`, flag: `🇫🇷` },
    'me-central1': { location: `Doha, Qatar, Middle East`, flag: `🇶🇦` },
    'me-central2': {
        location: `Dammam, Saudi Arabia, Middle East`,
        flag: `🇸🇦`,
    },
    'me-west1': { location: `Tel Aviv, Israel, Middle East`, flag: `🇮🇱` },
    'northamerica-northeast1': {
        location: `Montréal, Québec, North America`,
        flag: `🇨🇦`,
    },
    'northamerica-northeast2': {
        location: `Toronto, Ontario, North America`,
        flag: `🇨🇦`,
    },
    'northamerica-south1': {
        location: `Queretaro, Mexico, North America`,
        flag: `🇲🇽`,
    },
    'southamerica-east1': {
        location: `Osasco, São Paulo, Brazil, South America`,
        flag: `🇧🇷`,
    },
    'southamerica-west1': {
        location: `Santiago, Chile, South America`,
        flag: `🇨🇱`,
    },
    'us-central1': {
        location: `Council Bluffs, Iowa, North America`,
        flag: `🇺🇸`,
    },
    'us-east1': {
        location: `Moncks Corner, South Carolina, North America`,
        flag: `🇺🇸`,
    },
    'us-east4': { location: `Ashburn, Virginia, North America`, flag: `🇺🇸` },
    'us-east5': { location: `Columbus, Ohio, North America`, flag: `🇺🇸` },
    'us-south1': { location: `Dallas, Texas, North America`, flag: `🇺🇸` },
    'us-west1': { location: `The Dalles, Oregon, North America`, flag: `🇺🇸` },
    'us-west2': {
        location: `Los Angeles, California, North America`,
        flag: `🇺🇸`,
    },
    'us-west3': { location: `Salt Lake City, Utah, North America`, flag: `🇺🇸` },
    'us-west4': { location: `Las Vegas, Nevada, North America`, flag: `🇺🇸` },
};

export const getProviderLocationDetails = (
    provider: string | undefined,
    region: string | undefined
) => {
    if (!provider || !region) {
        return null;
    }

    if (provider.toUpperCase() === 'AWS') {
        return aws[region] ?? defaultResponse;
    }

    if (provider.toUpperCase() === 'GCP') {
        return gcp[region] ?? defaultResponse;
    }

    if (provider.toUpperCase() === 'AZURE' || provider.toUpperCase() === 'AZ') {
        return azure[region] ?? defaultResponse;
    }

    return defaultResponse;
};
