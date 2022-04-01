import { Auth } from '@supabase/ui';
import { supabase } from 'services/supabase';

const Unauthenticated = () => {
    return <Auth providers={['google', 'github']} supabaseClient={supabase} />;
};

export default Unauthenticated;
