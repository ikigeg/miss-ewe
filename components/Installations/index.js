import { useEffect } from 'react';
import { useAuthContext } from '../../context/auth';
import Avatar from '../Avatar';

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
    return <div>No installations found for your GitHub login</div>;
  }

  const handleChoice = (key) => {
    setInstallationId(key);
  };

  const resetChoice = () => {
    setInstallationId();
  };

  if (installationId) {
    const installation = installations.installations.filter(
      (i) => i.id === installationId
    )[0];

    return (
      <div>
        Chosen installation:
        <div>
          {installation.account.login}
          <Avatar
            src={installation.account.avatar_url}
            url={installation.account.html_url}
            alt={installation.account.login}
          />
          <button type="button" onClick={resetChoice}>
            Reset choice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      Choose an installation:
      {installations.installations.map((i) => (
        <div key={i.id}>
          {i.account.login}
          <Avatar
            src={i.account.avatar_url}
            url={i.account.html_url}
            alt={i.account.login}
          />
          <button type="button" onClick={() => handleChoice(i.id)}>
            Go
          </button>
        </div>
      ))}
    </div>
  );
}
