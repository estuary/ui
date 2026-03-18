// Sources:
// - AWS: https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html
// - GCP: https://status.cloud.google.com/regional/americas
// - Azure: https://learn.microsoft.com/en-us/azure/reliability/regions-list

import type { DataPlaneCloudProvider as CloudProvider } from 'src/gql-types/graphql';

export const PROVIDER_LABELS: Record<CloudProvider, string> = {
    AWS: 'Amazon Web Services',
    GCP: 'Google Cloud Platform',
    AZURE: 'Microsoft Azure',
    LOCAL: 'Local',
};

export const AWS_REGIONS: Record<string, string> = {
    'us-east-1': 'US East (N. Virginia)',
    'us-east-2': 'US East (Ohio)',
    'us-west-1': 'US West (N. California)',
    'us-west-2': 'US West (Oregon)',
    'us-gov-east-1': 'AWS GovCloud (US-East)',
    'us-gov-west-1': 'AWS GovCloud (US-West)',
    'af-south-1': 'Africa (Cape Town)',
    'ap-east-1': 'Asia Pacific (Hong Kong)',
    'ap-south-2': 'Asia Pacific (Hyderabad)',
    'ap-southeast-3': 'Asia Pacific (Jakarta)',
    'ap-southeast-5': 'Asia Pacific (Malaysia)',
    'ap-southeast-4': 'Asia Pacific (Melbourne)',
    'ap-south-1': 'Asia Pacific (Mumbai)',
    'ap-southeast-6': 'Asia Pacific (New Zealand)',
    'ap-northeast-3': 'Asia Pacific (Osaka)',
    'ap-northeast-2': 'Asia Pacific (Seoul)',
    'ap-southeast-1': 'Asia Pacific (Singapore)',
    'ap-southeast-2': 'Asia Pacific (Sydney)',
    'ap-east-2': 'Asia Pacific (Taipei)',
    'ap-southeast-7': 'Asia Pacific (Thailand)',
    'ap-northeast-1': 'Asia Pacific (Tokyo)',
    'ca-central-1': 'Canada (Central)',
    'ca-west-1': 'Canada West (Calgary)',
    'eu-central-1': 'Europe (Frankfurt)',
    'eu-west-1': 'Europe (Ireland)',
    'eu-west-2': 'Europe (London)',
    'eu-south-1': 'Europe (Milan)',
    'eu-west-3': 'Europe (Paris)',
    'eu-south-2': 'Europe (Spain)',
    'eu-north-1': 'Europe (Stockholm)',
    'eu-central-2': 'Europe (Zurich)',
    'il-central-1': 'Israel (Tel Aviv)',
    'mx-central-1': 'Mexico (Central)',
    'me-south-1': 'Middle East (Bahrain)',
    'me-central-1': 'Middle East (UAE)',
    'sa-east-1': 'South America (São Paulo)',
};

const GCP_REGIONS: Record<string, string> = {
    // Americas
    'us-central1': 'US Central (Iowa)',
    'us-east1': 'US East (South Carolina)',
    'us-east4': 'US East (N. Virginia)',
    'us-east5': 'US East (Columbus)',
    'us-south1': 'US South (Dallas)',
    'us-west1': 'US West (Oregon)',
    'us-west2': 'US West (Los Angeles)',
    'us-west3': 'US West (Salt Lake City)',
    'us-west4': 'US West (Las Vegas)',
    'northamerica-northeast1': 'Canada (Montréal)',
    'northamerica-northeast2': 'Canada (Toronto)',
    'northamerica-south1': 'Mexico (Querétaro)',
    'southamerica-east1': 'South America (São Paulo)',
    'southamerica-west1': 'South America (Santiago)',

    // Europe
    'europe-west1': 'Europe West (Belgium)',
    'europe-west2': 'Europe West (London)',
    'europe-west3': 'Europe West (Frankfurt)',
    'europe-west4': 'Europe West (Netherlands)',
    'europe-west6': 'Europe West (Zurich)',
    'europe-west8': 'Europe West (Milan)',
    'europe-west9': 'Europe West (Paris)',
    'europe-west10': 'Europe West (Berlin)',
    'europe-west12': 'Europe West (Turin)',
    'europe-central2': 'Europe Central (Warsaw)',
    'europe-north1': 'Europe North (Finland)',
    'europe-north2': 'Europe North (Stockholm)',
    'europe-southwest1': 'Europe Southwest (Madrid)',

    // Asia Pacific
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

    // Middle East
    'me-central1': 'Middle East (Doha)',
    'me-central2': 'Middle East (Dammam)',
    'me-west1': 'Middle East (Tel Aviv)',

    // Africa
    'africa-south1': 'Africa (Johannesburg)',
};

const AZURE_REGIONS: Record<string, string> = {
    // Americas
    brazilsouth: 'Brazil South (São Paulo)',
    brazilsoutheast: 'Brazil Southeast (Rio de Janeiro)',
    canadacentral: 'Canada Central (Toronto)',
    canadaeast: 'Canada East (Quebec City)',
    centralus: 'Central US (Iowa)',
    chilecentral: 'Chile Central (Santiago)',
    eastus: 'East US (Virginia)',
    eastus2: 'East US 2 (Virginia)',
    mexicocentral: 'Mexico Central (Querétaro)',
    northcentralus: 'North Central US (Illinois)',
    southcentralus: 'South Central US (Texas)',
    westcentralus: 'West Central US (Wyoming)',
    westus: 'West US (California)',
    westus2: 'West US 2 (Washington)',
    westus3: 'West US 3 (Arizona)',

    // Europe
    austriaeast: 'Austria East (Vienna)',
    belgiumcentral: 'Belgium Central (Brussels)',
    denmarkeast: 'Denmark East (Copenhagen)',
    francecentral: 'France Central (Paris)',
    francesouth: 'France South (Marseille)',
    germanynorth: 'Germany North (Berlin)',
    germanywestcentral: 'Germany West Central (Frankfurt)',
    italynorth: 'Italy North (Milan)',
    northeurope: 'North Europe (Ireland)',
    norwayeast: 'Norway East (Oslo)',
    norwaywest: 'Norway West (Stavanger)',
    polandcentral: 'Poland Central (Warsaw)',
    spaincentral: 'Spain Central (Madrid)',
    swedencentral: 'Sweden Central (Gävle)',
    switzerlandnorth: 'Switzerland North (Zürich)',
    switzerlandwest: 'Switzerland West (Geneva)',
    uksouth: 'UK South (London)',
    ukwest: 'UK West (Cardiff)',
    westeurope: 'West Europe (Netherlands)',

    // Asia Pacific
    australiacentral: 'Australia Central (Canberra)',
    australiacentral2: 'Australia Central 2 (Canberra)',
    australiaeast: 'Australia East (Sydney)',
    australiasoutheast: 'Australia Southeast (Melbourne)',
    centralindia: 'Central India (Pune)',
    eastasia: 'East Asia (Hong Kong)',
    indonesiacentral: 'Indonesia Central (Jakarta)',
    japaneast: 'Japan East (Tokyo)',
    japanwest: 'Japan West (Osaka)',
    koreacentral: 'Korea Central (Seoul)',
    koreasouth: 'Korea South (Busan)',
    malaysiawest: 'Malaysia West (Kuala Lumpur)',
    newzealandnorth: 'New Zealand North (Auckland)',
    southindia: 'South India (Chennai)',
    southeastasia: 'Southeast Asia (Singapore)',
    westindia: 'West India (Mumbai)',

    // Middle East
    israelcentral: 'Israel Central (Tel Aviv)',
    qatarcentral: 'Qatar Central (Doha)',
    uaecentral: 'UAE Central (Abu Dhabi)',
    uaenorth: 'UAE North (Dubai)',

    // Africa
    southafricanorth: 'South Africa North (Johannesburg)',
    southafricawest: 'South Africa West (Cape Town)',
};
const REGION_MAPS: Record<CloudProvider, Record<string, string>> = {
    AWS: AWS_REGIONS,
    GCP: GCP_REGIONS,
    AZURE: AZURE_REGIONS,
    LOCAL: {},
};

export const getRegionDisplayName = (
    provider: CloudProvider,
    region: string
): string => {
    const regionMap = REGION_MAPS[provider];
    return regionMap?.[region] ?? `${provider}/${region}`;
};
