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
            chosenRepos,
            issues,
            setIssues,
          }}
        />
      ) : null}

      {/* <button type="button" onClick={() => setFetchIssues(true)}>
        Get Issues
      </button>
      <Repositories
        {...{
          user,
          access_token,
          loadingRepos,
          setLoadingRepos,
          repos,
          setRepos,
          chosen,
          setChosen,
        }}
      />
      <Issues
        {...{
          user,
          access_token,
          fetchIssues,
          setFetchIssues,
          loadingIssues,
          setLoadingIssues,
          chosen,
          issues,
          setIssues,
        }}
      /> */}
    </div>
  );
}
