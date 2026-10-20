// Label and ISO 3166-1 alpha-2 country per region. Sources:
// - AWS: https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html
// - GCP: https://status.cloud.google.com/regional/americas
// - Azure: https://learn.microsoft.com/en-us/azure/reliability/regions-list

export type CloudProvider = 'AWS' | 'GCP' | 'AZURE';

type RegionTable = Record<string, readonly [label: string, country: string]>;

export const PROVIDER_LABELS: Record<CloudProvider, string> = {
    AWS: 'Amazon Web Services',
    GCP: 'Google Cloud Platform',
    AZURE: 'Microsoft Azure',
};

export const AWS_REGIONS: RegionTable = {
    'us-east-1': ['US East (N. Virginia)', 'US'],
    'us-east-2': ['US East (Ohio)', 'US'],
    'us-west-1': ['US West (N. California)', 'US'],
    'us-west-2': ['US West (Oregon)', 'US'],
    'us-gov-east-1': ['AWS GovCloud (US-East)', 'US'],
    'us-gov-west-1': ['AWS GovCloud (US-West)', 'US'],
    'af-south-1': ['Africa (Cape Town)', 'ZA'],
    'ap-east-1': ['Asia Pacific (Hong Kong)', 'HK'],
    'ap-south-2': ['Asia Pacific (Hyderabad)', 'IN'],
    'ap-southeast-3': ['Asia Pacific (Jakarta)', 'ID'],
    'ap-southeast-5': ['Asia Pacific (Malaysia)', 'MY'],
    'ap-southeast-4': ['Asia Pacific (Melbourne)', 'AU'],
    'ap-south-1': ['Asia Pacific (Mumbai)', 'IN'],
    'ap-southeast-6': ['Asia Pacific (New Zealand)', 'NZ'],
    'ap-northeast-3': ['Asia Pacific (Osaka)', 'JP'],
    'ap-northeast-2': ['Asia Pacific (Seoul)', 'KR'],
    'ap-southeast-1': ['Asia Pacific (Singapore)', 'SG'],
    'ap-southeast-2': ['Asia Pacific (Sydney)', 'AU'],
    'ap-east-2': ['Asia Pacific (Taipei)', 'TW'],
    'ap-southeast-7': ['Asia Pacific (Thailand)', 'TH'],
    'ap-northeast-1': ['Asia Pacific (Tokyo)', 'JP'],
    'ca-central-1': ['Canada (Central)', 'CA'],
    'ca-west-1': ['Canada West (Calgary)', 'CA'],
    'eu-central-1': ['Europe (Frankfurt)', 'DE'],
    'eu-west-1': ['Europe (Ireland)', 'IE'],
    'eu-west-2': ['Europe (London)', 'GB'],
    'eu-south-1': ['Europe (Milan)', 'IT'],
    'eu-west-3': ['Europe (Paris)', 'FR'],
    'eu-south-2': ['Europe (Spain)', 'ES'],
    'eu-north-1': ['Europe (Stockholm)', 'SE'],
    'eu-central-2': ['Europe (Zurich)', 'CH'],
    'il-central-1': ['Israel (Tel Aviv)', 'IL'],
    'mx-central-1': ['Mexico (Central)', 'MX'],
    'me-south-1': ['Middle East (Bahrain)', 'BH'],
    'me-central-1': ['Middle East (UAE)', 'AE'],
    'sa-east-1': ['South America (São Paulo)', 'BR'],
};

const GCP_REGIONS: RegionTable = {
    // Americas
    'us-central1': ['US Central (Iowa)', 'US'],
    'us-east1': ['US East (South Carolina)', 'US'],
    'us-east4': ['US East (N. Virginia)', 'US'],
    'us-east5': ['US East (Columbus)', 'US'],
    'us-south1': ['US South (Dallas)', 'US'],
    'us-west1': ['US West (Oregon)', 'US'],
    'us-west2': ['US West (Los Angeles)', 'US'],
    'us-west3': ['US West (Salt Lake City)', 'US'],
    'us-west4': ['US West (Las Vegas)', 'US'],
    'northamerica-northeast1': ['Canada (Montréal)', 'CA'],
    'northamerica-northeast2': ['Canada (Toronto)', 'CA'],
    'northamerica-south1': ['Mexico (Querétaro)', 'MX'],
    'southamerica-east1': ['South America (São Paulo)', 'BR'],
    'southamerica-west1': ['South America (Santiago)', 'CL'],

    // Europe
    'europe-west1': ['Europe West (Belgium)', 'BE'],
    'europe-west2': ['Europe West (London)', 'GB'],
    'europe-west3': ['Europe West (Frankfurt)', 'DE'],
    'europe-west4': ['Europe West (Netherlands)', 'NL'],
    'europe-west6': ['Europe West (Zurich)', 'CH'],
    'europe-west8': ['Europe West (Milan)', 'IT'],
    'europe-west9': ['Europe West (Paris)', 'FR'],
    'europe-west10': ['Europe West (Berlin)', 'DE'],
    'europe-west12': ['Europe West (Turin)', 'IT'],
    'europe-central2': ['Europe Central (Warsaw)', 'PL'],
    'europe-north1': ['Europe North (Finland)', 'FI'],
    'europe-north2': ['Europe North (Stockholm)', 'SE'],
    'europe-southwest1': ['Europe Southwest (Madrid)', 'ES'],

    // Asia Pacific
    'asia-east1': ['Asia Pacific (Taiwan)', 'TW'],
    'asia-east2': ['Asia Pacific (Hong Kong)', 'HK'],
    'asia-northeast1': ['Asia Pacific (Tokyo)', 'JP'],
    'asia-northeast2': ['Asia Pacific (Osaka)', 'JP'],
    'asia-northeast3': ['Asia Pacific (Seoul)', 'KR'],
    'asia-south1': ['Asia Pacific (Mumbai)', 'IN'],
    'asia-south2': ['Asia Pacific (Delhi)', 'IN'],
    'asia-southeast1': ['Asia Pacific (Singapore)', 'SG'],
    'asia-southeast2': ['Asia Pacific (Jakarta)', 'ID'],
    'asia-southeast3': ['Asia Pacific (Bangkok)', 'TH'],
    'australia-southeast1': ['Australia (Sydney)', 'AU'],
    'australia-southeast2': ['Australia (Melbourne)', 'AU'],

    // Middle East
    'me-central1': ['Middle East (Doha)', 'QA'],
    'me-central2': ['Middle East (Dammam)', 'SA'],
    'me-west1': ['Middle East (Tel Aviv)', 'IL'],

    // Africa
    'africa-south1': ['Africa (Johannesburg)', 'ZA'],
};

const AZURE_REGIONS: RegionTable = {
    // Americas
    brazilsouth: ['Brazil South (São Paulo)', 'BR'],
    brazilsoutheast: ['Brazil Southeast (Rio de Janeiro)', 'BR'],
    canadacentral: ['Canada Central (Toronto)', 'CA'],
    canadaeast: ['Canada East (Quebec City)', 'CA'],
    centralus: ['Central US (Iowa)', 'US'],
    chilecentral: ['Chile Central (Santiago)', 'CL'],
    eastus: ['East US (Virginia)', 'US'],
    eastus2: ['East US 2 (Virginia)', 'US'],
    mexicocentral: ['Mexico Central (Querétaro)', 'MX'],
    northcentralus: ['North Central US (Illinois)', 'US'],
    southcentralus: ['South Central US (Texas)', 'US'],
    westcentralus: ['West Central US (Wyoming)', 'US'],
    westus: ['West US (California)', 'US'],
    westus2: ['West US 2 (Washington)', 'US'],
    westus3: ['West US 3 (Arizona)', 'US'],

    // Europe
    austriaeast: ['Austria East (Vienna)', 'AT'],
    belgiumcentral: ['Belgium Central (Brussels)', 'BE'],
    denmarkeast: ['Denmark East (Copenhagen)', 'DK'],
    francecentral: ['France Central (Paris)', 'FR'],
    francesouth: ['France South (Marseille)', 'FR'],
    germanynorth: ['Germany North (Berlin)', 'DE'],
    germanywestcentral: ['Germany West Central (Frankfurt)', 'DE'],
    italynorth: ['Italy North (Milan)', 'IT'],
    northeurope: ['North Europe (Ireland)', 'IE'],
    norwayeast: ['Norway East (Oslo)', 'NO'],
    norwaywest: ['Norway West (Stavanger)', 'NO'],
    polandcentral: ['Poland Central (Warsaw)', 'PL'],
    spaincentral: ['Spain Central (Madrid)', 'ES'],
    swedencentral: ['Sweden Central (Gävle)', 'SE'],
    swedensouth: ['Sweden South (Malmö)', 'SE'],
    switzerlandnorth: ['Switzerland North (Zürich)', 'CH'],
    switzerlandwest: ['Switzerland West (Geneva)', 'CH'],
    uksouth: ['UK South (London)', 'GB'],
    ukwest: ['UK West (Cardiff)', 'GB'],
    westeurope: ['West Europe (Netherlands)', 'NL'],

    // Asia Pacific
    australiacentral: ['Australia Central (Canberra)', 'AU'],
    australiacentral2: ['Australia Central 2 (Canberra)', 'AU'],
    australiaeast: ['Australia East (Sydney)', 'AU'],
    australiasoutheast: ['Australia Southeast (Melbourne)', 'AU'],
    centralindia: ['Central India (Pune)', 'IN'],
    eastasia: ['East Asia (Hong Kong)', 'HK'],
    indiasouthcentral: ['India South Central (Hyderabad)', 'IN'],
    indonesiacentral: ['Indonesia Central (Jakarta)', 'ID'],
    jioindiacentral: ['Jio India Central (Nagpur)', 'IN'],
    jioindiawest: ['Jio India West (Jamnagar)', 'IN'],
    japaneast: ['Japan East (Tokyo)', 'JP'],
    japanwest: ['Japan West (Osaka)', 'JP'],
    koreacentral: ['Korea Central (Seoul)', 'KR'],
    koreasouth: ['Korea South (Busan)', 'KR'],
    malaysiawest: ['Malaysia West (Kuala Lumpur)', 'MY'],
    newzealandnorth: ['New Zealand North (Auckland)', 'NZ'],
    southindia: ['South India (Chennai)', 'IN'],
    taiwannorth: ['Taiwan North (Taipei)', 'TW'],
    southeastasia: ['Southeast Asia (Singapore)', 'SG'],
    westindia: ['West India (Mumbai)', 'IN'],

    // Middle East
    israelcentral: ['Israel Central (Tel Aviv)', 'IL'],
    qatarcentral: ['Qatar Central (Doha)', 'QA'],
    uaecentral: ['UAE Central (Abu Dhabi)', 'AE'],
    uaenorth: ['UAE North (Dubai)', 'AE'],

    // Africa
    southafricanorth: ['South Africa North (Johannesburg)', 'ZA'],
    southafricawest: ['South Africa West (Cape Town)', 'ZA'],
};

export const CLOUD_REGIONS: Record<CloudProvider, RegionTable> = {
    AWS: AWS_REGIONS,
    GCP: GCP_REGIONS,
    AZURE: AZURE_REGIONS,
};

export const getRegion = (
    provider: string,
    region: string
): RegionTable[string] | undefined =>
    (CLOUD_REGIONS as Partial<Record<string, RegionTable>>)[provider]?.[region];

export const getRegionDisplayName = (
    provider: CloudProvider,
    region: string
): string => getRegion(provider, region)?.[0] ?? `${provider}/${region}`;
