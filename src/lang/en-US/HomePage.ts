import { CommonMessages } from './CommonMessages';

export const HomePage: Record<string, string> = {
    'home.main.header': `Welcome to Flow!`,
    'home.main.description': `Click the captures icon on the menu bar to get started.`,

    'home.hero.tab.ariaLabel': `Welcome Image Tabs`,
    'home.hero.tab.companyOverview': `What we do`,
    'home.hero.tab.companyDetails': `How it works`,
    'home.hero.tab.demo': `Live Demo`,

    'home.hero.companyOverview.cta': `How it works`,
    'home.hero.companyOverview.description': `{emphasis} helps you sync your data between the sources that produce it and destinations that consume it in real-time.`,
    'home.hero.companyOverview.description.emphasis': `${CommonMessages.productName}`,

    'home.hero.companyDetails.cta': `New capture`,
    'home.hero.companyDetails.step1': `Set up real-time data ingestion from your sources. Click “New Capture” to get started.`,
    'home.hero.companyDetails.step2': `Keep destination systems up to date with materializations: low latency views of your data.`,

    'home.hero.demo.demoTenant.header': `Testing out Flow just got easier`,
    'home.hero.demo.demoTenant': `Estuary has a public {sharableTenant} tenant that can help you see Flow in action while you get set up. To give your tenant, {userTenant}, read access to it, {button}.`,
    'home.hero.demo.demoTenant.button': `click here`,

    'home.hero.1.title': `Wikipedia Data`,
    'home.hero.1.message': `Flow {emphasis} about 100 events per second from the Wikipedia's API.`,
    'home.hero.1.message.emphasis': `captures`,
    'home.hero.1.button': `See the capture`,

    'home.hero.2.title': `Transformation`,
    'home.hero.2.message': `We use a {emphasis} to aggregate the raw data.`,
    'home.hero.2.message.emphasis': `${CommonMessages['terms.derivation']}`,
    'home.hero.2.button': `See the collection`,

    'home.hero.3.title': `Google Sheets`,
    'home.hero.3.message': `Flow {emphasis} a fact table with real-time updates.`,
    'home.hero.3.message.emphasis': `materializes`,
    'home.hero.3.button': `See the materialization`,

    'home.hero.button': `See The Demo`,

    // Welcome
    'welcome.image.alt': `A diagram showing the Flow logo at the center, connected by pipelines to multiple endpoint systems. Source systems on the left feed data into Flow and destination systems on the right receive data from Flow.`,
    'welcome.demo.alt': `A data pipeline diagram showing data moving into Flow from the Wikipedia HTTP source, and coming out of Flow into the Google Sheets destination.`,
};
