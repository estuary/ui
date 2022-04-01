import { Auth, Button, Typography } from "@supabase/ui";
import { supaClient } from "services/supabase";

//const Unauthenticated = () => {
//    return <Login />;
//};

//export default Unauthenticated;



const { Text } = Typography


const Container = (props: any) => {
    const { user } = Auth.useUser();
    /* eslint-disable react/destructuring-assignment */
    if (user) {
        return (
            <>
                <Text>Signed in: {user.email}</Text>
                <Button block onClick={() => props.supabaseClient.auth.signOut()}>
                    Sign out
                </Button>
            </>
        );
    }
    return props.children;
    /* eslint-enable */
};

export default function Home() {
    return (
        <Auth.UserContextProvider supabaseClient={supaClient}>
            <Container>
                <Auth providers={['github']} supabaseClient={supaClient} />
            </Container>
        </Auth.UserContextProvider>
    );
};