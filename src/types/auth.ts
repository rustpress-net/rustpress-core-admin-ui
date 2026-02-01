/**
 * Authentication Provider Types - RustPress SSO/OAuth Integration
 *
 * Supports 30+ authentication providers for enterprise and consumer login
 */

/**
 * Authentication provider identifiers
 */
export type AuthProviderId =
  // Enterprise SSO
  | 'azure_ad'
  | 'okta'
  | 'auth0'
  | 'onelogin'
  | 'ping_identity'
  | 'jumpcloud'
  | 'duo_security'
  | 'keycloak'
  | 'aws_cognito'
  | 'google_workspace'
  // Generic Protocols
  | 'saml'
  | 'oidc'
  | 'ldap'
  // Social/Consumer
  | 'google'
  | 'microsoft'
  | 'facebook'
  | 'apple'
  | 'twitter'
  | 'linkedin'
  | 'amazon'
  | 'yahoo'
  // Developer Platforms
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'atlassian'
  // Communication
  | 'slack'
  | 'discord'
  | 'zoom'
  // Business
  | 'salesforce'
  | 'hubspot'
  | 'stripe'
  // Other Popular
  | 'spotify'
  | 'twitch'
  | 'reddit'
  | 'dropbox';

/**
 * Provider category for UI organization
 */
export type AuthProviderCategory =
  | 'enterprise'
  | 'protocol'
  | 'social'
  | 'developer'
  | 'communication'
  | 'business';

/**
 * Protocol type for the provider
 */
export type AuthProtocol = 'oauth2' | 'oidc' | 'saml' | 'ldap';

/**
 * Provider configuration status
 */
export type ProviderStatus = 'enabled' | 'disabled' | 'configured' | 'error';

/**
 * User attribute mapping from provider to RustPress
 */
export interface AttributeMapping {
  providerId: string;        // Field name in provider response
  rustpressField: string;    // RustPress user field
  required: boolean;
  defaultValue?: string;
  transform?: 'lowercase' | 'uppercase' | 'trim' | 'none';
}

/**
 * OAuth2/OIDC specific configuration
 */
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  scopes: string[];
  responseType?: 'code' | 'token';
  pkceEnabled?: boolean;
}

/**
 * SAML specific configuration
 */
export interface SAMLConfig {
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  certificate: string;
  signatureAlgorithm?: 'sha256' | 'sha512';
  digestAlgorithm?: 'sha256' | 'sha512';
  nameIdFormat?: 'email' | 'persistent' | 'transient' | 'unspecified';
  assertionConsumerServiceUrl?: string;
  wantAssertionsSigned?: boolean;
  wantMessagesSigned?: boolean;
}

/**
 * LDAP specific configuration
 */
export interface LDAPConfig {
  serverUrl: string;
  bindDn: string;
  bindPassword: string;
  baseDn: string;
  userSearchFilter: string;
  groupSearchFilter?: string;
  useTls: boolean;
  tlsCertificate?: string;
  connectionTimeout?: number;
  searchTimeout?: number;
}

/**
 * Role mapping from provider groups/roles to RustPress roles
 */
export interface RoleMapping {
  providerRole: string;      // Role/group name from provider
  rustpressRole: string;     // RustPress role (admin, editor, author, subscriber)
  priority: number;          // Higher priority wins if multiple match
}

/**
 * Provider-specific UI and branding
 */
export interface ProviderBranding {
  name: string;
  displayName: string;
  icon: string;              // Lucide icon name or custom SVG
  color: string;             // Brand color hex
  description: string;
  documentationUrl?: string;
}

/**
 * Complete authentication provider configuration
 */
export interface AuthProvider {
  id: AuthProviderId;
  category: AuthProviderCategory;
  protocol: AuthProtocol;
  branding: ProviderBranding;
  status: ProviderStatus;

  // Protocol-specific config (only one will be used based on protocol)
  oauthConfig?: OAuthConfig;
  samlConfig?: SAMLConfig;
  ldapConfig?: LDAPConfig;

  // Common settings
  enabled: boolean;
  autoCreateUsers: boolean;
  updateUserOnLogin: boolean;
  defaultRole: string;
  allowedDomains?: string[];     // Restrict to specific email domains
  blockedDomains?: string[];     // Block specific domains

  // Mappings
  attributeMappings: AttributeMapping[];
  roleMappings: RoleMapping[];

  // Advanced
  jitProvisioning: boolean;      // Just-in-time user provisioning
  forceReauth: boolean;          // Force re-authentication on each login
  sessionDuration?: number;      // Custom session duration in minutes
  mfaRequired: boolean;          // Require MFA for this provider

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  lastUsed?: string;
  loginCount?: number;
}

/**
 * Authentication settings for the entire system
 */
export interface AuthSettings {
  // Login page settings
  allowLocalLogin: boolean;          // Allow username/password login
  allowRegistration: boolean;        // Allow new user registration
  defaultProvider?: AuthProviderId;  // Auto-redirect to this provider
  showProviderButtons: boolean;      // Show SSO buttons on login page

  // Security settings
  sessionTimeout: number;            // Session timeout in minutes
  maxLoginAttempts: number;          // Max failed attempts before lockout
  lockoutDuration: number;           // Lockout duration in minutes
  requireEmailVerification: boolean;
  requireMfa: boolean;

  // Password policy (for local login)
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  passwordExpiryDays: number;        // 0 = never expires

  // Branding
  loginPageTitle?: string;
  loginPageLogo?: string;
  loginPageBackground?: string;
  customCss?: string;
}

/**
 * Provider metadata for UI display
 */
export const AUTH_PROVIDERS: Record<AuthProviderId, Omit<AuthProvider, 'status' | 'enabled' | 'oauthConfig' | 'samlConfig' | 'ldapConfig' | 'attributeMappings' | 'roleMappings' | 'autoCreateUsers' | 'updateUserOnLogin' | 'defaultRole' | 'jitProvisioning' | 'forceReauth' | 'mfaRequired'>> = {
  // Enterprise SSO
  azure_ad: {
    id: 'azure_ad',
    category: 'enterprise',
    protocol: 'oidc',
    branding: {
      name: 'azure_ad',
      displayName: 'Microsoft Azure AD',
      icon: 'Cloud',
      color: '#0078D4',
      description: 'Enterprise identity management with Azure Active Directory',
      documentationUrl: 'https://docs.microsoft.com/en-us/azure/active-directory/',
    },
  },
  okta: {
    id: 'okta',
    category: 'enterprise',
    protocol: 'oidc',
    branding: {
      name: 'okta',
      displayName: 'Okta',
      icon: 'Shield',
      color: '#007DC1',
      description: 'Enterprise identity and access management',
      documentationUrl: 'https://developer.okta.com/',
    },
  },
  auth0: {
    id: 'auth0',
    category: 'enterprise',
    protocol: 'oidc',
    branding: {
      name: 'auth0',
      displayName: 'Auth0',
      icon: 'Lock',
      color: '#EB5424',
      description: 'Flexible authentication and authorization platform',
      documentationUrl: 'https://auth0.com/docs/',
    },
  },
  onelogin: {
    id: 'onelogin',
    category: 'enterprise',
    protocol: 'saml',
    branding: {
      name: 'onelogin',
      displayName: 'OneLogin',
      icon: 'KeyRound',
      color: '#00297A',
      description: 'Cloud-based identity and access management',
      documentationUrl: 'https://developers.onelogin.com/',
    },
  },
  ping_identity: {
    id: 'ping_identity',
    category: 'enterprise',
    protocol: 'oidc',
    branding: {
      name: 'ping_identity',
      displayName: 'Ping Identity',
      icon: 'Fingerprint',
      color: '#B8232F',
      description: 'Intelligent identity solutions for the enterprise',
      documentationUrl: 'https://docs.pingidentity.com/',
    },
  },
  jumpcloud: {
    id: 'jumpcloud',
    category: 'enterprise',
    protocol: 'saml',
    branding: {
      name: 'jumpcloud',
      displayName: 'JumpCloud',
      icon: 'CloudCog',
      color: '#38B865',
      description: 'Cloud directory platform for IT admins',
      documentationUrl: 'https://support.jumpcloud.com/',
    },
  },
  duo_security: {
    id: 'duo_security',
    category: 'enterprise',
    protocol: 'oidc',
    branding: {
      name: 'duo_security',
      displayName: 'Duo Security',
      icon: 'ShieldCheck',
      color: '#6DC04B',
      description: 'Two-factor authentication and access security',
      documentationUrl: 'https://duo.com/docs/',
    },
  },
  keycloak: {
    id: 'keycloak',
    category: 'enterprise',
    protocol: 'oidc',
    branding: {
      name: 'keycloak',
      displayName: 'Keycloak',
      icon: 'Key',
      color: '#4D4D4D',
      description: 'Open source identity and access management',
      documentationUrl: 'https://www.keycloak.org/documentation',
    },
  },
  aws_cognito: {
    id: 'aws_cognito',
    category: 'enterprise',
    protocol: 'oidc',
    branding: {
      name: 'aws_cognito',
      displayName: 'AWS Cognito',
      icon: 'Cloud',
      color: '#FF9900',
      description: 'Amazon Web Services user identity management',
      documentationUrl: 'https://docs.aws.amazon.com/cognito/',
    },
  },
  google_workspace: {
    id: 'google_workspace',
    category: 'enterprise',
    protocol: 'oidc',
    branding: {
      name: 'google_workspace',
      displayName: 'Google Workspace',
      icon: 'Building2',
      color: '#4285F4',
      description: 'Google Workspace (formerly G Suite) SSO',
      documentationUrl: 'https://support.google.com/a/answer/60224',
    },
  },

  // Generic Protocols
  saml: {
    id: 'saml',
    category: 'protocol',
    protocol: 'saml',
    branding: {
      name: 'saml',
      displayName: 'SAML 2.0',
      icon: 'FileKey',
      color: '#6B7280',
      description: 'Generic SAML 2.0 identity provider',
      documentationUrl: 'https://wiki.oasis-open.org/security/FrontPage',
    },
  },
  oidc: {
    id: 'oidc',
    category: 'protocol',
    protocol: 'oidc',
    branding: {
      name: 'oidc',
      displayName: 'OpenID Connect',
      icon: 'Globe',
      color: '#F78C40',
      description: 'Generic OpenID Connect provider',
      documentationUrl: 'https://openid.net/connect/',
    },
  },
  ldap: {
    id: 'ldap',
    category: 'protocol',
    protocol: 'ldap',
    branding: {
      name: 'ldap',
      displayName: 'LDAP / Active Directory',
      icon: 'Server',
      color: '#0078D4',
      description: 'LDAP or on-premise Active Directory',
      documentationUrl: 'https://ldap.com/',
    },
  },

  // Social/Consumer
  google: {
    id: 'google',
    category: 'social',
    protocol: 'oauth2',
    branding: {
      name: 'google',
      displayName: 'Google',
      icon: 'Chrome',
      color: '#4285F4',
      description: 'Sign in with Google account',
      documentationUrl: 'https://developers.google.com/identity/',
    },
  },
  microsoft: {
    id: 'microsoft',
    category: 'social',
    protocol: 'oauth2',
    branding: {
      name: 'microsoft',
      displayName: 'Microsoft',
      icon: 'AppWindow',
      color: '#00A4EF',
      description: 'Sign in with Microsoft personal account',
      documentationUrl: 'https://docs.microsoft.com/en-us/azure/active-directory/develop/',
    },
  },
  facebook: {
    id: 'facebook',
    category: 'social',
    protocol: 'oauth2',
    branding: {
      name: 'facebook',
      displayName: 'Facebook',
      icon: 'Facebook',
      color: '#1877F2',
      description: 'Sign in with Facebook account',
      documentationUrl: 'https://developers.facebook.com/docs/facebook-login/',
    },
  },
  apple: {
    id: 'apple',
    category: 'social',
    protocol: 'oauth2',
    branding: {
      name: 'apple',
      displayName: 'Apple',
      icon: 'Apple',
      color: '#000000',
      description: 'Sign in with Apple ID',
      documentationUrl: 'https://developer.apple.com/sign-in-with-apple/',
    },
  },
  twitter: {
    id: 'twitter',
    category: 'social',
    protocol: 'oauth2',
    branding: {
      name: 'twitter',
      displayName: 'X (Twitter)',
      icon: 'Twitter',
      color: '#000000',
      description: 'Sign in with X (formerly Twitter)',
      documentationUrl: 'https://developer.twitter.com/en/docs/authentication',
    },
  },
  linkedin: {
    id: 'linkedin',
    category: 'social',
    protocol: 'oauth2',
    branding: {
      name: 'linkedin',
      displayName: 'LinkedIn',
      icon: 'Linkedin',
      color: '#0A66C2',
      description: 'Sign in with LinkedIn account',
      documentationUrl: 'https://docs.microsoft.com/en-us/linkedin/',
    },
  },
  amazon: {
    id: 'amazon',
    category: 'social',
    protocol: 'oauth2',
    branding: {
      name: 'amazon',
      displayName: 'Amazon',
      icon: 'ShoppingCart',
      color: '#FF9900',
      description: 'Sign in with Amazon account',
      documentationUrl: 'https://developer.amazon.com/docs/login-with-amazon/',
    },
  },
  yahoo: {
    id: 'yahoo',
    category: 'social',
    protocol: 'oauth2',
    branding: {
      name: 'yahoo',
      displayName: 'Yahoo',
      icon: 'Mail',
      color: '#6001D2',
      description: 'Sign in with Yahoo account',
      documentationUrl: 'https://developer.yahoo.com/',
    },
  },

  // Developer Platforms
  github: {
    id: 'github',
    category: 'developer',
    protocol: 'oauth2',
    branding: {
      name: 'github',
      displayName: 'GitHub',
      icon: 'Github',
      color: '#181717',
      description: 'Sign in with GitHub account',
      documentationUrl: 'https://docs.github.com/en/developers/apps',
    },
  },
  gitlab: {
    id: 'gitlab',
    category: 'developer',
    protocol: 'oauth2',
    branding: {
      name: 'gitlab',
      displayName: 'GitLab',
      icon: 'GitBranch',
      color: '#FC6D26',
      description: 'Sign in with GitLab account',
      documentationUrl: 'https://docs.gitlab.com/ee/integration/oauth_provider.html',
    },
  },
  bitbucket: {
    id: 'bitbucket',
    category: 'developer',
    protocol: 'oauth2',
    branding: {
      name: 'bitbucket',
      displayName: 'Bitbucket',
      icon: 'GitBranch',
      color: '#0052CC',
      description: 'Sign in with Bitbucket account',
      documentationUrl: 'https://support.atlassian.com/bitbucket-cloud/',
    },
  },
  atlassian: {
    id: 'atlassian',
    category: 'developer',
    protocol: 'oauth2',
    branding: {
      name: 'atlassian',
      displayName: 'Atlassian',
      icon: 'Trello',
      color: '#0052CC',
      description: 'Sign in with Atlassian (Jira, Confluence)',
      documentationUrl: 'https://developer.atlassian.com/',
    },
  },

  // Communication
  slack: {
    id: 'slack',
    category: 'communication',
    protocol: 'oauth2',
    branding: {
      name: 'slack',
      displayName: 'Slack',
      icon: 'Hash',
      color: '#4A154B',
      description: 'Sign in with Slack workspace',
      documentationUrl: 'https://api.slack.com/authentication',
    },
  },
  discord: {
    id: 'discord',
    category: 'communication',
    protocol: 'oauth2',
    branding: {
      name: 'discord',
      displayName: 'Discord',
      icon: 'MessageCircle',
      color: '#5865F2',
      description: 'Sign in with Discord account',
      documentationUrl: 'https://discord.com/developers/docs/topics/oauth2',
    },
  },
  zoom: {
    id: 'zoom',
    category: 'communication',
    protocol: 'oauth2',
    branding: {
      name: 'zoom',
      displayName: 'Zoom',
      icon: 'Video',
      color: '#2D8CFF',
      description: 'Sign in with Zoom account',
      documentationUrl: 'https://marketplace.zoom.us/docs/guides/auth/oauth',
    },
  },

  // Business
  salesforce: {
    id: 'salesforce',
    category: 'business',
    protocol: 'oauth2',
    branding: {
      name: 'salesforce',
      displayName: 'Salesforce',
      icon: 'Cloud',
      color: '#00A1E0',
      description: 'Sign in with Salesforce account',
      documentationUrl: 'https://help.salesforce.com/s/articleView?id=sf.sso_about.htm',
    },
  },
  hubspot: {
    id: 'hubspot',
    category: 'business',
    protocol: 'oauth2',
    branding: {
      name: 'hubspot',
      displayName: 'HubSpot',
      icon: 'BarChart3',
      color: '#FF7A59',
      description: 'Sign in with HubSpot account',
      documentationUrl: 'https://developers.hubspot.com/docs/api/oauth-quickstart-guide',
    },
  },
  stripe: {
    id: 'stripe',
    category: 'business',
    protocol: 'oauth2',
    branding: {
      name: 'stripe',
      displayName: 'Stripe',
      icon: 'CreditCard',
      color: '#635BFF',
      description: 'Sign in with Stripe Connect',
      documentationUrl: 'https://stripe.com/docs/connect',
    },
  },

  // Other Popular
  spotify: {
    id: 'spotify',
    category: 'social',
    protocol: 'oauth2',
    branding: {
      name: 'spotify',
      displayName: 'Spotify',
      icon: 'Music',
      color: '#1DB954',
      description: 'Sign in with Spotify account',
      documentationUrl: 'https://developer.spotify.com/documentation/general/guides/authorization/',
    },
  },
  twitch: {
    id: 'twitch',
    category: 'social',
    protocol: 'oauth2',
    branding: {
      name: 'twitch',
      displayName: 'Twitch',
      icon: 'Tv',
      color: '#9146FF',
      description: 'Sign in with Twitch account',
      documentationUrl: 'https://dev.twitch.tv/docs/authentication/',
    },
  },
  reddit: {
    id: 'reddit',
    category: 'social',
    protocol: 'oauth2',
    branding: {
      name: 'reddit',
      displayName: 'Reddit',
      icon: 'MessageSquare',
      color: '#FF4500',
      description: 'Sign in with Reddit account',
      documentationUrl: 'https://www.reddit.com/dev/api/oauth',
    },
  },
  dropbox: {
    id: 'dropbox',
    category: 'social',
    protocol: 'oauth2',
    branding: {
      name: 'dropbox',
      displayName: 'Dropbox',
      icon: 'HardDrive',
      color: '#0061FF',
      description: 'Sign in with Dropbox account',
      documentationUrl: 'https://www.dropbox.com/developers/documentation/http/documentation#oauth2',
    },
  },
};

/**
 * Category metadata for UI display
 */
export const AUTH_CATEGORIES: Record<AuthProviderCategory, { label: string; description: string; icon: string }> = {
  enterprise: {
    label: 'Enterprise SSO',
    description: 'Enterprise identity providers for corporate single sign-on',
    icon: 'Building2',
  },
  protocol: {
    label: 'Generic Protocols',
    description: 'Standard authentication protocols for custom integrations',
    icon: 'FileCode',
  },
  social: {
    label: 'Social Login',
    description: 'Consumer social media and personal accounts',
    icon: 'Users',
  },
  developer: {
    label: 'Developer Platforms',
    description: 'Developer tools and code hosting platforms',
    icon: 'Code',
  },
  communication: {
    label: 'Communication',
    description: 'Team chat and video conferencing platforms',
    icon: 'MessageSquare',
  },
  business: {
    label: 'Business Tools',
    description: 'CRM, marketing, and business software',
    icon: 'Briefcase',
  },
};

/**
 * Default scopes for common providers
 */
export const DEFAULT_SCOPES: Partial<Record<AuthProviderId, string[]>> = {
  google: ['openid', 'email', 'profile'],
  microsoft: ['openid', 'email', 'profile', 'User.Read'],
  azure_ad: ['openid', 'email', 'profile', 'User.Read'],
  github: ['read:user', 'user:email'],
  gitlab: ['read_user', 'openid', 'email'],
  facebook: ['email', 'public_profile'],
  apple: ['name', 'email'],
  twitter: ['tweet.read', 'users.read'],
  linkedin: ['r_liteprofile', 'r_emailaddress'],
  slack: ['identity.basic', 'identity.email'],
  discord: ['identify', 'email'],
  okta: ['openid', 'email', 'profile'],
  auth0: ['openid', 'email', 'profile'],
  salesforce: ['openid', 'email', 'profile'],
};

/**
 * Default attribute mappings for common providers
 */
export const DEFAULT_ATTRIBUTE_MAPPINGS: Partial<Record<AuthProviderId, AttributeMapping[]>> = {
  google: [
    { providerId: 'sub', rustpressField: 'external_id', required: true },
    { providerId: 'email', rustpressField: 'email', required: true },
    { providerId: 'name', rustpressField: 'display_name', required: false },
    { providerId: 'picture', rustpressField: 'avatar_url', required: false },
  ],
  github: [
    { providerId: 'id', rustpressField: 'external_id', required: true },
    { providerId: 'email', rustpressField: 'email', required: true },
    { providerId: 'name', rustpressField: 'display_name', required: false },
    { providerId: 'login', rustpressField: 'username', required: false },
    { providerId: 'avatar_url', rustpressField: 'avatar_url', required: false },
  ],
  azure_ad: [
    { providerId: 'oid', rustpressField: 'external_id', required: true },
    { providerId: 'email', rustpressField: 'email', required: true },
    { providerId: 'name', rustpressField: 'display_name', required: false },
    { providerId: 'preferred_username', rustpressField: 'username', required: false },
  ],
};
