// Sources:
// - AWS: https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html
// - GCP: https://status.cloud.google.com/regional/americas

const AWS_REGIONS: Record<string, string> = {
    'af-south-1': 'Africa (Cape Town)',
    'ap-east-1': 'Asia Pacific (Hong Kong)',
    'ap-east-2': 'Asia Pacific (Taipei)',
    'ap-northeast-1': 'Asia Pacific (Tokyo)',
    'ap-northeast-2': 'Asia Pacific (Seoul)',
    'ap-northeast-3': 'Asia Pacific (Osaka)',
    'ap-south-1': 'Asia Pacific (Mumbai)',
    'ap-south-2': 'Asia Pacific (Hyderabad)',
    'ap-southeast-1': 'Asia Pacific (Singapore)',
    'ap-southeast-2': 'Asia Pacific (Sydney)',
    'ap-southeast-3': 'Asia Pacific (Jakarta)',
    'ap-southeast-4': 'Asia Pacific (Melbourne)',
    'ap-southeast-5': 'Asia Pacific (Malaysia)',
    'ap-southeast-6': 'Asia Pacific (New Zealand)',
    'ap-southeast-7': 'Asia Pacific (Thailand)',
    'ca-central-1': 'Canada (Central)',
    'ca-west-1': 'Canada West (Calgary)',
    'eu-central-1': 'Europe (Frankfurt)',
    'eu-central-2': 'Europe (Zurich)',
    'eu-north-1': 'Europe (Stockholm)',
    'eu-south-1': 'Europe (Milan)',
    'eu-south-2': 'Europe (Spain)',
    'eu-west-1': 'Europe (Ireland)',
    'eu-west-2': 'Europe (London)',
    'eu-west-3': 'Europe (Paris)',
    'il-central-1': 'Israel (Tel Aviv)',
    'me-central-1': 'Middle East (UAE)',
    'me-south-1': 'Middle East (Bahrain)',
    'mx-central-1': 'Mexico (Central)',
    'sa-east-1': 'South America (São Paulo)',
    'us-east-1': 'US East (N. Virginia)',
    'us-east-2': 'US East (Ohio)',
    'us-gov-east-1': 'AWS GovCloud (US-East)',
    'us-gov-west-1': 'AWS GovCloud (US-West)',
    'us-west-1': 'US West (N. California)',
    'us-west-2': 'US West (Oregon)',
};

const GCP_REGIONS: Record<string, string> = {
    'africa-south1': 'Africa (Johannesburg)',
    'asia-east1': 'Asia Pacific (Taiwan)',
    'asia-east2': 'Asia Pacific (Hong Kong)',
    'asia-northeast1': 'Asia Pacific (Tokyo)',
    'asia-northeast2': 'Asia Pacific (Osaka)',
    'asia-northeast3': 'Asia Pacific (Seoul)',
    'asia-south1': 'Asia Pacific (Mumbai)',
    'asia-south2': 'Asia Pacific (Delhi)',
    'asia-southeast1': 'Asia Pacific (Singapore)',
    'asia-southeast2': 'Asia Pacific (Jakarta)',
    'australia-southeast1': 'Australia (Sydney)',
    'australia-southeast2': 'Australia (Melbourne)',
    'europe-central2': 'Europe Central (Warsaw)',
    'europe-north1': 'Europe North (Finland)',
    'europe-north2': 'Europe North (Stockholm)',
    'europe-southwest1': 'Europe Southwest (Madrid)',
    'europe-west1': 'Europe West (Belgium)',
    'europe-west10': 'Europe West (Berlin)',
    'europe-west12': 'Europe West (Turin)',
    'europe-west2': 'Europe West (London)',
    'europe-west3': 'Europe West (Frankfurt)',
    'europe-west4': 'Europe West (Netherlands)',
    'europe-west6': 'Europe West (Zurich)',
    'europe-west8': 'Europe West (Milan)',
    'europe-west9': 'Europe West (Paris)',
    'me-central1': 'Middle East (Doha)',
    'me-central2': 'Middle East (Dammam)',
    'me-west1': 'Middle East (Tel Aviv)',
    'northamerica-northeast1': 'Canada (Montréal)',
    'northamerica-northeast2': 'Canada (Toronto)',
    'northamerica-south1': 'Mexico (Querétaro)',
    'southamerica-east1': 'South America (São Paulo)',
    'southamerica-west1': 'South America (Santiago)',
    'us-central1': 'US Central (Iowa)',
    'us-east1': 'US East (South Carolina)',
    'us-east4': 'US East (N. Virginia)',
    'us-east5': 'US East (Columbus)',
    'us-south1': 'US South (Dallas)',
    'us-west1': 'US West (Oregon)',
    'us-west2': 'US West (Los Angeles)',
    'us-west3': 'US West (Salt Lake City)',
    'us-west4': 'US West (Las Vegas)',
};

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
    aws: 'Amazon Web Services',
    gcp: 'Google Cloud Platform',
    azure: 'Microsoft Azure',
};

const PROVIDER_SHORT_NAMES: Record<string, string> = {
    aws: 'AWSx',
    gcp: 'GCP',
    azure: 'MS Azure',
};

const REGION_MAPS: Record<string, Record<string, string>> = {
    aws: AWS_REGIONS,
    gcp: GCP_REGIONS,
};

export const getProviderDisplayName = (provider: string): string => {
    return (
        PROVIDER_DISPLAY_NAMES[provider.toLowerCase()] ?? provider.toUpperCase()
    );
};

export const getProviderShortName = (provider: string): string => {
    return (
        PROVIDER_SHORT_NAMES[provider.toLowerCase()] ?? provider.toUpperCase()
    );
};

export const getRegionDisplayName = (
    provider: string,
    region: string
): string => {
    const regionMap = REGION_MAPS[provider.toLowerCase()];
    return regionMap?.[region] ?? region + provider;
};
