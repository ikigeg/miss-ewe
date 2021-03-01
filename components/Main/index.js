import { useEffect, useState } from 'react';

import { useAuthContext } from '../../context/auth';
import Installations from '../Installations';
import Repositories from '../Repositories';
import Issues from '../Issues';

export default function Main() {
  const { installationToken } = useAuthContext();

  const [repos, setRepos] = useState();
  const [chosenRepos, setChosenRepos] = useState(new Set());

  const [issues, setIssues] = useState();

  useEffect(() => {
    if (!installationToken && chosenRepos && chosenRepos.size) {
      setChosenRepos(new Set());
      setIssues();
    }
  }, [installationToken, setChosenRepos, setIssues]);

  return (
    <div>
      <Installations />

      {installationToken ? (
        <Repositories
          {...{
            repos,
            setRepos,
            chosenRepos,
            setChosenRepos,
          }}
        />
      ) : null}

      {chosenRepos ? (
        <Issues
          {...{
            repos,
            chosenRepos,
            issues,
            setIssues,
          }}
        />
      ) : null}
    </div>
  );
}
