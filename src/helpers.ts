import axios from 'axios';
import _ from 'lodash';

export async function getPendoReport<T>(apiToken: string, id: string) {
  const pendoAPIUrl = `https://app.pendo.io/api/v1/report/${id}/results.json`;
  const { data } = await axios.get<T>(pendoAPIUrl, {
    headers: {
      'X-Pendo-Integration-Key': apiToken,
      'Content-Type': 'application/json'
    }
  });

  return data;
}

export async function getLxAccessToken(instance: string, apiToken: string): Promise<string> {
  const lxMtmUrl = `https://${instance}/services/mtm/v1/oauth2/token`;
  const encodedApiToken = Buffer.from(`apitoken:${apiToken}`, 'utf8').toString('base64');
  const { data: mtmResponseData } = await axios.post(lxMtmUrl, 'grant_type=client_credentials', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${encodedApiToken}`
    }
  });

  const accessToken = mtmResponseData.access_token;

  if (!accessToken || _.get(mtmResponseData, 'expired')) {
    throw new Error('Access Token not valid');
  }

  return accessToken;
}

export async function lxGqlRequest(instance: string, accessToken: string, query: string, variables: Record<string, unknown>) {
  const lxPfUrl = `https://${instance}/services/pathfinder/v1/graphql`;
  const lxGqlResponse = await axios.post(lxPfUrl, JSON.stringify({ query, variables }), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!_.isNull(_.get(lxGqlResponse, 'data.errors'))) {
    const errors: Array<{ message: string; location: unknown }> = _.get(lxGqlResponse, 'data.errors');
    throw new Error(errors.map(({ message }) => message).join('|'));
  }

  return _.get(lxGqlResponse, 'data.data.result.factSheet');
}
