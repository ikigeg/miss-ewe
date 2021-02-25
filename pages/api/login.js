import FormData from 'form-data';
import qs from 'querystringify';

export default async (event) => {
  const { request } = event;
  const { headers, method } = request;
  const contentType = headers.get('content-type') || '';

  if (method === 'POST' && contentType.includes('application/json')) {
    const jsonBody = await request.json();

    if (!jsonBody.code) {
      return {};
    }

    const data = new FormData();
    data.append('client_id', MISS_EWE_GITHUB_CLIENT_ID);
    data.append('client_secret', MISS_EWE_GITHUB_CLIENT_SECRET);
    data.append('code', jsonBody.code);
    data.append('state', jsonBody.state);

    let access_token = '';
    let user = {};
    let installations = {};

    try {
      const accessTokenResponse = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          body: data,
        }
      );
      const accessTokenText = await accessTokenResponse.text();

      ({ access_token } = qs.parse(accessTokenText));

      const userReponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${access_token}`,
          'User-Agent': 'CF_WRANGLER-miss-ewe-0.1.0',
        },
      });
      user = await userReponse.json();

      const installationsReponse = await fetch(
        'https://api.github.com/user/installations',
        {
          headers: {
            Authorization: `token ${access_token}`,
            'User-Agent': 'CF_WRANGLER-miss-ewe-0.1.0',
          },
        }
      );
      installations = await installationsReponse.json();
    } catch (err) {
      return { err };
    }

    return {
      access_token,
      user,
      installations,
      code: jsonBody.code,
      state: jsonBody.state,
    };
  }

  return {};
};
