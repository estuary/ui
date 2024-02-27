import { Provider } from '@supabase/supabase-js';

export type SupportedProvider = Extract<
    Provider,
    'azure' | 'github' | 'google'
>;

// To support marketplace we must first support logging in with that provider
// There was not really a great place to make this connection clear so this
//  felt good enough for now.
export type MarketPlaceProviders = Extract<SupportedProvider, 'google'>;
