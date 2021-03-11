import { useState } from 'react';

import { useAuthContext } from '../../context/auth';
import Installations from '../Installations';
import Repositories from '../Repositories';
import Issues from '../Issues';
import Alerts from '../Alerts';

const VIEW_ISSUES = 'issues';
const VIEW_ALERTS = 'alerts';

export default function Main() {
  const { installationToken } = useAuthContext();

  const [repos, setRepos] = useState();
  const [chosenRepos, setChosenRepos] = useState(new Set());

  const [issues, setIssues] = useState();
  const [alerts, setAlerts] = useState();

  const [viewing, setViewing] = useState(VIEW_ISSUES);
  const viewIssues = () => setViewing(VIEW_ISSUES);
  const viewAlerts = () => setViewing(VIEW_ALERTS);

  const resetIssues = () => {
    setIssues([]);
    if (viewing !== VIEW_ISSUES) {
      setViewing(VIEW_ISSUES);
    }
  };

  const resetAlerts = () => {
    setAlerts([]);
    if (viewing !== VIEW_ALERTS) {
      setViewing(VIEW_ALERTS);
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
            viewAlerts,
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

      {chosenRepos && viewing === VIEW_ALERTS ? (
        <Alerts
          {...{
            repos,
            chosenRepos,
            alerts,
            setAlerts,
            resetAlerts,
          }}
        />
      ) : null}
    </div>
  );
}
