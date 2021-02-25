const queryGithub = async ({ access_token, query, variables } = {}) => {
  if (!access_token || !query) {
    throw new Error('Missing required arguments');
  }

  const result = await fetch('https://api.github.com/graphql', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ query, variables }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.log(e);
    });

  return result.data;
};

export default queryGithub;
