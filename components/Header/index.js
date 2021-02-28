import Avatar from '../Avatar';

import { CLIENT_ID, REDIRECT_URI } from '../../config';

import './style.css';

export default function Header({ user, loading, loginId }) {
  const loginUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${loginId}`;

  return (
    <div className="header">
      <div className="header-logo">
        <h1>Miss Ewe</h1>
        <a href="/" title="Home">
          <img
            src="img/missEwe.png"
            style={{
              width: 'auto',
              maxHeight: '10rem',
            }}
          />
        </a>
      </div>
      <div className="header-user">
        {!user && !loading ? (
          <>
            <div>Welcome to Miss Ewe!</div>
            <div>
              To get started, please{' '}
              <a href={loginUrl}>click here to login with GitHub</a>
            </div>
          </>
        ) : null}
        {!user && loading ? <div>Just checking your creds</div> : null}
        {user && !loading ? (
          <>
            <div>
              Hello {user.login}, nice baaa-vatar{' '}
              <Avatar
                src={user.avatar_url}
                url={user.html_url}
                alt={user.name}
              />
            </div>
            <div>
              having problems? <a href={loginUrl}>login again</a>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
