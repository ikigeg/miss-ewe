import { useState } from 'react';

import { useAuthContext } from '../../context/auth';
import Installations from '../Installations';
import Repositories from '../Repositories';
import Issues from '../Issues';

export default function Main() {
  const { installationToken } = useAuthContext();

  const [repos, setRepos] = useState();
  const [chosenRepos, setChosenRepos] = useState(new Set());

  const [issues, setIssues] = useState();
  console.log('installationToken', installationToken);
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
