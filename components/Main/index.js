import { useState } from 'react';

import { useAuthContext } from '../../context/auth';
import Installations from '../Installations';
import Repositories from '../Repositories';
import Issues from '../Issues';
import DependabotAlerts from '../DependabotAlerts';

const VIEW_ISSUES = 'issues';
const VIEW_DEPENDABOT_ALERTS = 'dependabotAlerts';

export default function Main() {
  const { installationToken } = useAuthContext();

  const [repos, setRepos] = useState();
  const [chosenRepos, setChosenRepos] = useState(new Set());

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
            viewIssues,
            viewDependabotAlerts,
          }}
        />
      ) : null}

      {chosenRepos && viewing === VIEW_ISSUES ? (
        <Issues
          {...{
            repos,
            chosenRepos,
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
            dependabotAlerts,
            setDependabotAlerts,
            resetDependabotAlerts,
          }}
        />
      ) : null}
    </div>
  );
}
