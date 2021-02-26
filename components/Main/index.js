import { useState } from 'react';

import { useAuthContext } from '../../context/auth';
import Installations from '../Installations';
import Repositories from '../Repositories';
import Issues from '../Issues';

export default function Main() {
  const { installationId } = useAuthContext();

  const [repos, setRepos] = useState();
  const [chosenRepos, setChosenRepos] = useState(new Set());

  const [issues, setIssues] = useState();

  // const [loadingIssues, setLoadingIssues] = useState(false);
  // const [issues, setIssues] = useState();

  // useEffect(() => {
  //   const fetchIssues = async () => {
  //     if (!issues && !loading) {
  //       setLoading(true);
  //       const data = await queryGithub({ access_token, query, variables });
  //       setRepos(data);
  //       setLoading(false);
  //     }
  //   }
  //   fetchIssues();
  // }, [user, access_token, repos]);

  // if (!user || !access_token || !repos) {
  //   return <p>Fetching issues</p>;
  // }

  return (
    <div>
      <Installations />

      {installationId ? (
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
