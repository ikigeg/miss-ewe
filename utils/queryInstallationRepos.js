const queryGithubApi = async ({
  access_token,
  installationId,
  page = 0,
} = {}) => {
  if (!access_token || !installationId) {
    throw new Error('Missing required arguments');
  }

  const url = `https://api.github.com/user/installations/${installationId}/repositories?per_page=100&page=${page}`;

  const result = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
      authorization: `Bearer ${access_token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.log(e);
    });

  return result;
};

export default queryGithubApi;
