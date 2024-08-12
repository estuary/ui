export interface DefaultLoginProps {
    grantToken?: string;
}

export interface MagicLinkProps extends DefaultLoginProps {
    hideCodeInput?: boolean;
}
