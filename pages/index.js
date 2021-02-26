import Main from '../components/Main';
import Avatar from '../components/Avatar';

import { CLIENT_ID, REDIRECT_URI } from '../config';

export default function Index({ user, loading, loginId }) {
  if (loading) {
    return <div>Loading...</div>;
  }

  const loginUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${loginId}`;

  if (!user && !loading) {
    return <a href={loginUrl}>Login with GitHub</a>;
  }

  return (
    <>
      <div>
        Hello {user.login}, nice baaa-vatar{' '}
        <Avatar src={user.avatar_url} url={user.html_url} alt={user.name} />
      </div>
      <Main />
      <div>
        having problems? <a href={loginUrl}>login again</a>
      </div>
    </>
  );
}
