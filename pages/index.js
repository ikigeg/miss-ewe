import { useEffect } from 'react';

const REDIRECT_URI = 'http://localhost:8080/authed';
const CLIENT_ID = 'Iv1.95a7da62ada9504f';

export default function Index({ user, access_token, loading, loginId }) {
  console.log({ user, access_token, loading, loginId });

  console.log('Index', 1);
  useEffect(() => {
    console.log('Index', 2);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user && !loading) {
    return (
      <a
        href={`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${loginId}`}
      >
        <span>Login with GitHub</span>
      </a>
    );
  }

  return (
    <div>
      <h1>my-github-issues</h1>
      <p>
        Check{' '}
        <a
          href={`https://github.com/settings/connections/applications/${CLIENT_ID}`}
        >
          app permissions
        </a>
      </p>

      <p>you are logged in as {JSON.stringify(user)}</p>

      {/* <Review {...{ user, access_token }} /> */}
    </div>
  );
}
