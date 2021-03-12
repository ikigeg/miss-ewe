import { useEffect, useState } from 'react';
import get from 'lodash/get';

import { useAuthContext } from '../../context/auth';
import queryGithub from '../../utils/queryGithub';
import Loader from '../Loader';
import DependabotAlert from '../DependabotAlert';

import './style.css';

const severities = {
  LOW: 10,
  MODERATE: 20,
  HIGH: 30,
  CRITICAL: 40,
};

const query = `
  query OpenDependabotAlerts($ids: [ID!]!) {
    nodes(ids: $ids) {
      id
      ... on Repository {
        name
        vulnerabilityAlerts(first: 50) {
          edges {
            node {
              id
              createdAt
              dismissedAt
              securityVulnerability {
                severity
                package {
                  name
                  ecosystem
                }
                vulnerableVersionRange
                advisory {
                  id
                  permalink
                  publishedAt
                  severity
                  summary
                  withdrawnAt
                  description
                  notificationsPermalink
                  origin
                  references {
                    url
                  }
                  identifiers {
                    type
                    value
                  }
                }
              }
              vulnerableManifestFilename
              vulnerableRequirements
              vulnerableManifestPath
              dismisser {
                login
                url
              }
            }
          }
          totalCount
        }
      }
    }
  }
`;

export default function DependabotAlerts({
  chosenRepos,
  repos,
  dependabotAlerts,
  setDependabotAlerts,
  resetDependabotAlerts,
}) {
  const { access_token } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [showMatching, setShowMatching] = useState(false);
  const [showSelected, setShowSelected] = useState('open');
  const [matching, setMatching] = useState('');
  const [sortBy, setSortBy] = useState('severityCreatedAt');
  const [total, setTotal] = useState(0);
  const [fetched, setFetched] = useState(0);

  useEffect(() => {
    let allDependabotAlerts = [];
    let done = false;
    let lastIdx = 0;

    const getDependabotAlerts = async () => {
      setLoading(true);

      while (!done) {
        const chosenLength = [...(chosenRepos || [])].length;

        if (lastIdx === 0) {
          setTotal(chosenLength);
        }

        // we take max 20 repo ids at a time
        const selectedIds = [...(chosenRepos || [])].slice(
          lastIdx,
          lastIdx + 20
        );
        if (!selectedIds || selectedIds.length === 0) {
          done = true;
          setFetched(chosenLength);
          continue;
        }

        const data = await queryGithub({
          access_token,
          query,
          variables: { ids: selectedIds },
        });

        const nodes = get(data, 'nodes', []);
        if (nodes.length === 0) {
          done = true;
          setFetched(chosenLength);
          continue;
        }

        lastIdx = lastIdx + 20;

        const batch = nodes.reduce((acc, cv) => {
          const edges = get(cv, 'vulnerabilityAlerts.edges', []);
          acc.push(
            ...edges.map((e) => ({
              ...e.node,
              repoId: cv.id,
              repoName: cv.name,
              createdAtInt: new Date(e.node.createdAt).getTime(),
            }))
          );
          return acc;
        }, []);
        allDependabotAlerts.push(...batch);
        setFetched(lastIdx);
      }

      lastIdx = 0;
      setDependabotAlerts(allDependabotAlerts || []);
      setLoading(false);
    };

    if (
      chosenRepos &&
      chosenRepos.size > 0 &&
      (!dependabotAlerts || dependabotAlerts.length === 0)
    ) {
      getDependabotAlerts();
    }
  }, [
    access_token,
    queryGithub,
    chosenRepos,
    setLoading,
    setTotal,
    setFetched,
    dependabotAlerts,
  ]);

  if (!chosenRepos || chosenRepos.size === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="dependabot-alerts">
        <h2>Dependabot Alerts</h2>
        <div className="loading">
          <p>Fetching dependabot alerts</p>
          <Loader total={total} fetched={fetched} />
        </div>
      </div>
    );
  }

  const reposById = repos.reduce((acc, cv) => {
    if (chosenRepos.has(cv.id)) {
      acc[cv.id] = cv;
    }
    return acc;
  }, {});

  const handleMatchingChange = (e) => {
    setMatching(e.target.value);

    if (matching === '' && !setShowMatching) {
      setShowMatching(false);
    } else if (matching !== '') {
      setShowMatching(true);
    }
  };

  const resetMatching = () => {
    setMatching('');
    setShowMatching(false);
  };

  const visibleDependabotAlerts = () => {
    if (sortBy === 'default' && !showMatching && showSelected === 'all') {
      return dependabotAlerts;
    }

    const filtered =
      showMatching || showSelected !== 'all'
        ? dependabotAlerts.filter((alert) => {
            let visible = false;
            if (showSelected === 'open' && !alert.dismissedAt) {
              visible = true;
            }
            if (showSelected === 'dismissed' && alert.dismissedAt) {
              visible = true;
            }
            if (
              showMatching &&
              alert.securityVulnerability.package.name
                .toLowerCase()
                .includes(matching.toLowerCase())
            ) {
              visible = true;
            }
            return visible;
          })
        : dependabotAlerts;

    if (sortBy === 'default') {
      return filtered;
    }

    if (sortBy === 'createdAt') {
      return filtered.sort((a, b) => b.createdAtInt - a.createdAtInt);
    }

    if (sortBy === 'severityCreatedAt') {
      return filtered.sort(
        (a, b) =>
          severities[b.securityVulnerability.severity] -
            severities[a.securityVulnerability.severity] ||
          b.createdAtInt - a.createdAtInt
      );
    }

    return filtered.sort((a, b) => {
      if (
        a.securityVulnerability.package.name.toLowerCase() <
        b.securityVulnerability.package.name.toLowerCase()
      ) {
        return -1;
      }
      if (
        a.securityVulnerability.package.name.toLowerCase() >
        b.securityVulnerability.package.name.toLowerCase()
      ) {
        return 1;
      }
      return 0;
    });
  };

  return (
    <div className="dependabot-alerts">
      <h2>
        Dependabot Alerts{' '}
        <button
          type="button"
          onClick={() => {
            resetDependabotAlerts();
          }}
        >
          Refresh
        </button>
      </h2>
      <div className="dependabot-alerts-controls">
        <div>
          Show:
          <select
            onChange={(e) => {
              setShowSelected(e.currentTarget.value);
            }}
            value={showSelected}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
        <div>
          Sort:
          <select
            onChange={(e) => {
              setSortBy(e.currentTarget.value);
            }}
            value={sortBy}
          >
            <option value="default">Default</option>
            <option value="severityCreatedAt">Severity and Newest</option>
            <option value="createdAt">Newest to oldest</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        <div>
          <label>
            Search:
            <input
              type="text"
              value={matching}
              onChange={handleMatchingChange}
              placeholder="Enter partial name here"
            />
          </label>
          <button type="button" onClick={resetMatching}>
            Clear
          </button>
        </div>
      </div>
      {dependabotAlerts && dependabotAlerts.length
        ? visibleDependabotAlerts().map((dependabotAlert, idx) => (
            <DependabotAlert
              key={`${dependabotAlert.repoId}-${dependabotAlert.id}-${idx}`}
              idx={idx}
              {...dependabotAlert}
              repo={reposById[dependabotAlert.repoId]}
            />
          ))
        : null}
    </div>
  );
}
