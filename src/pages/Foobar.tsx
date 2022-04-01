
import { PostgrestClient } from '@supabase/postgrest-js';
import { useEffect, useState } from 'react';
import { auth } from '../services/auth';



export default function Foobar() {
  const [loading, setLoading] = useState(true);
  const [stuff, setStuff] = useState(true);

  const token = auth.getToken();
  const postgrest = new PostgrestClient(
    'https://api.estuary.dev/v1',
    { headers: { "Authorization": `Bearer ${token.accessToken}` } },
  );

  const getStuff = async () => {
    try {
      setLoading(true)

      const { data, error /*, status*/ } = await postgrest
        .from('connector_tags')
        .select(`
          id,
          image_tag,
          protocol,
          connectors(id,image_name)
        `)
        .order('updated_at', {ascending: false})
        .limit(1)
        .single();

      if (error) {
        throw new Error(`${error}`);
      }

      if (data) {
        setStuff(data)
      }

      /*
      const user = supabase.auth.user()

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
      */
    } catch (error) {
      /* eslint-disable no-alert */
      if (error instanceof Error) {
        alert(error.message);
      }
      /* eslint-enable */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getStuff()
  }, [])

  return (
    <div aria-live="polite">
      {loading ? (
        'Loading ...'
      ) : (
        <code>{stuff}</code>
      )}
    </div>
  )
}