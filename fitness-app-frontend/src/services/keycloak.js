import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8181',
  realm: 'fitness-oauth2',
  clientId: 'oauth2-pkce-client',
});

export default keycloak;
