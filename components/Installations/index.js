import { useEffect } from 'react';
import { Link } from 'react-feather';

import { useAuthContext } from '../../context/auth';
import Avatar from '../Avatar';

import './style.css';

export default function Main() {
  const {
    installations,
    installationId,
    setInstallationId,
    setInstallationToken,
  } = useAuthContext();

  useEffect(() => {
    const getInstallationToken = async () => {
      const response = await fetch('/api/github', {
        method: 'POST',
        body: JSON.stringify({ installationId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const { token } = await response.json();

      if (token) {
        setInstallationToken(token);
      }
    };

    if (installationId) {
      getInstallationToken();
    }
  }, [installationId]);

  if (
    !installations ||
    !installations.total_count ||
    !installations.installations
  ) {
    return (
      <div className="installations">
        <h2>No installations detected!</h2>
        <p>
          Unfortunately it does not look like you have Miss Ewe installed for
          any of your Github Accounts.
        </p>
        <p>
          Not to worry, simply head to{' '}
          <a href="https://github.com/apps/miss-ewe">
            the Miss Ewe GitHub App page
          </a>{' '}
          and once installed pop right on back.
        </p>
      </div>
    );
  }

  const handleChoice = (key) => {
    setInstallationId(key);
  };

  if (installationId) {
    const installation = installations.installations.filter(
      (i) => i.id === installationId
    )[0];

    return (
      <div className="installations chosen">
        <div>
          <h2>Installation</h2>
        </div>
        <div className="installation">
          <Avatar
            src={installation.account.avatar_url}
            url={installation.account.html_url}
            alt={installation.account.login}
          />
          {installation.account.login}
          <a
            className="installation-link"
            href={installation.html_url}
            target="_blank"
            rel="noreferrer"
          >
            <Link style={{ width: '1.8rem', height: '1.8rem' }} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="installations">
      <h2>Please choose an installation:</h2>
      {installations.installations.map((i) => (
        <div
          key={i.id}
          className="installation clickable"
          onClick={() => handleChoice(i.id)}
        >
          <Avatar
            src={i.account.avatar_url}
            url={i.account.html_url}
            alt={i.account.login}
          />
          {i.account.login}
          <a
            className="installation-link"
            href={i.html_url}
            target="_blank"
            rel="noreferrer"
          >
            <Link style={{ width: '1.8rem', height: '1.8rem' }} />
          </a>
        </div>
      ))}
    </div>
  );
}
