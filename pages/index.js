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
      Hello {user.login}, nice baaa-vatar{' '}
      <img
        src={user.avatar_url}
        style={{ height: '3rem', width: 'auto', borderRadius: '100%' }}
      />
    </div>
  );
}
