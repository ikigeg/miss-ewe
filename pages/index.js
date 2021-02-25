import { CLIENT_ID, REDIRECT_URI } from '../config';

export default function Index({ user, loading, loginId }) {
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
