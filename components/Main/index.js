import { useState } from 'react';
import { FallbackStorage } from '@conclurer/local-storage-fallback';

import { useAuthContext } from '../../context/auth';
import Installations from '../Installations';
import Repositories from '../Repositories';
import Issues from '../Issues';
import DependabotAlerts from '../DependabotAlerts';

const VIEW_ISSUES = 'issues';
const VIEW_DEPENDABOT_ALERTS = 'dependabotAlerts';

const storage = new FallbackStorage();

export default function Main() {
  const { installationId, installationToken } = useAuthContext();
  const STORED_REPOS = `repos-${installationId}`;
  const STORED_CHOSEN = `chosen-${installationId}`;

  const [repos, setRepos] = useState(() => {
    const storedRepos = storage.getItem(STORED_REPOS);
    return storedRepos !== null ? JSON.parse(storedRepos) : undefined;
  });

  const [chosenRepos, setChosenRepos] = useState(() => {
    const storedChosen = storage.getItem(STORED_CHOSEN);
    const storedRepos = storage.getItem(STORED_REPOS);
    return storedRepos !== null && storedChosen !== null
      ? new Set(JSON.parse(storedChosen))
      : new Set();
  });

  const chosenReposById = () =>
    repos &&
    repos.reduce((acc, cv) => {
      if (chosenRepos.has(cv.id)) {
        acc[cv.id] = cv;
      }
      return acc;
    }, {});

  const chooseRepos = (selected = []) => {
    const finalSelected = [...selected];
    storage.setItem(STORED_CHOSEN, JSON.stringify(finalSelected));
    setChosenRepos(new Set(finalSelected));

    const reposToStore = repos.filter((r) => finalSelected.includes(r.id));
    storage.setItem(STORED_REPOS, JSON.stringify(reposToStore));
  };

  const [issues, setIssues] = useState();
  const [dependabotAlerts, setDependabotAlerts] = useState();

  const [viewing, setViewing] = useState(VIEW_ISSUES);
  const viewIssues = () => setViewing(VIEW_ISSUES);
  const viewDependabotAlerts = () => setViewing(VIEW_DEPENDABOT_ALERTS);

  const resetIssues = () => {
    setIssues([]);
    if (viewing !== VIEW_ISSUES) {
      setViewing(VIEW_ISSUES);
    }
  };

  const resetDependabotAlerts = () => {
    setDependabotAlerts([]);
    if (viewing !== VIEW_DEPENDABOT_ALERTS) {
      setViewing(VIEW_DEPENDABOT_ALERTS);
    }
  };

  const resetRepos = () => {
    storage.removeItem(STORED_REPOS);
    storage.removeItem(STORED_CHOSEN);
    setChosenRepos(new Set());
    setRepos(null);
    setIssues([]);
    setDependabotAlerts([]);
  };

  return (
    <div>
      <Installations />

      {installationToken ? (
        <Repositories
          {...{
            repos,
            setRepos,
            chosenRepos,
            chooseRepos,
            resetRepos,
            viewIssues,
            viewDependabotAlerts,
            hasChosen: chosenRepos && chosenRepos.size,
          }}
        />
      ) : null}

      {chosenRepos && viewing === VIEW_ISSUES ? (
        <Issues
          {...{
            repos,
            chosenRepos,
            chosenReposById,
            issues,
            setIssues,
            resetIssues,
          }}
        />
      ) : null}

      {chosenRepos && viewing === VIEW_DEPENDABOT_ALERTS ? (
        <DependabotAlerts
          {...{
            repos,
            chosenRepos,
            chosenReposById,
            dependabotAlerts,
            setDependabotAlerts,
            resetDependabotAlerts,
          }}
        />
      ) : null}
    </div>
  );
}
