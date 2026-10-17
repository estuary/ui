import { CommonMessages } from 'src/lang/en-US/CommonMessages';

export const HomePage: Record<string, string> = {
    'home.main.header': `Welcome to ${CommonMessages.productName}!`,
    'home.main.description': `Click the captures icon on the menu bar to get started.`,

    'home.hero.companyDetails.cta': `New capture`,
    'home.hero.companyDetails.step1': `Set up real-time data ingestion from your sources. Click “New Capture” to get started.`,
    'home.hero.companyDetails.step2': `Keep destination systems up to date with materializations: low latency views of your data.`,

    // Welcome
    'welcome.image.alt': `A diagram showing the ${CommonMessages.productName} logo at the center, connected by pipelines to multiple endpoint systems. Source systems on the left feed data into ${CommonMessages.productName} and destination systems on the right receive data from ${CommonMessages.productName}.`,
};
