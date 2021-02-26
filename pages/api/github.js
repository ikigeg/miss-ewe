import jwt from 'jsonwebtoken';

const privateKey = [
  MISS_EWE_PRIVATE_KEY_1,
  MISS_EWE_PRIVATE_KEY_2,
  MISS_EWE_PRIVATE_KEY_3,
].join('\n');

const generateJwt = () => {
  const time = Math.floor(Date.now() / 1000);
  const payload = {
    // # issued at time
    iat: time,
    // # JWT expiration time (10 minute maximum)
    exp: time + 600,
    // # GitHub App's identifier
    iss: MISS_EWE_GITHUB_APP_ID,
  };
  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
};

export default async (event) => {
  const { request } = event;
  const { headers, method } = request;
  const contentType = headers.get('content-type') || '';

  if (method === 'POST' && contentType.includes('application/json')) {
    const jsonBody = await request.json();

    if (!jsonBody.installationId) {
      return {};
    }
    const jwtToken = generateJwt();
    const response = await fetch(
      `https://api.github.com/app/installations/${jsonBody.installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'User-Agent': 'CF_WRANGLER-miss-ewe-github-0.1.0',
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    const json = await response.json();
    return { ...json };
  }

  return {};
};
