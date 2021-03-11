import { useEffect, useState } from 'react';
import get from 'lodash/get';

import { useAuthContext } from '../../context/auth';
import queryGithub from '../../utils/queryGithub';
import Loader from '../Loader';

const query = `
  query OpenAlerts($ids: [ID!]!) {
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
            }
          }
          totalCount
        }
      }
    }
  }
`;

/*
example output:
{
  "data": {
    "nodes": [
      {
        "id": "MDEwOlJlcG9zaXRvcnkxNDc0MTg2NTk=",
        "name": "starter-typescript",
        "vulnerabilityAlerts": {
          "edges": [
            {
              "node": {
                "id": "MDI4OlJlcG9zaXRvcnlWdWxuZXJhYmlsaXR5QWxlcnQyNDcyNzI5MzE=",
                "createdAt": "2020-04-01T08:54:49Z",
                "dismissedAt": null,
                "securityVulnerability": {
                  "severity": "LOW",
                  "package": {
                    "name": "kind-of",
                    "ecosystem": "NPM"
                  },
                  "vulnerableVersionRange": ">= 6.0.0, < 6.0.3",
                  "advisory": {
                    "id": "MDE2OlNlY3VyaXR5QWR2aXNvcnlHSFNBLTZjOGYtcXBoZy1xamdw",
                    "permalink": "https://github.com/advisories/GHSA-6c8f-qphg-qjgp",
                    "publishedAt": "2020-03-31T15:59:54Z",
                    "severity": "LOW",
                    "summary": "Validation Bypass in kind-of",
                    "withdrawnAt": null,
                    "description": "Versions of `kind-of` 6.x prior to 6.0.3 are vulnerable to a Validation Bypass. A maliciously crafted object can alter the result of the type check, allowing attackers to bypass the type checking validation. \n\n\n## Recommendation\n\nUpgrade to versions 6.0.3 or later.",
                    "notificationsPermalink": "https://github.com/advisories/GHSA-6c8f-qphg-qjgp/dependabot",
                    "origin": "UNSPECIFIED",
                    "references": [
                      {
                        "url": "https://nvd.nist.gov/vuln/detail/CVE-2019-20149"
                      },
                      {
                        "url": "https://github.com/advisories/GHSA-6c8f-qphg-qjgp"
                      }
                    ],
                    "identifiers": [
                      {
                        "type": "GHSA",
                        "value": "GHSA-6c8f-qphg-qjgp"
                      },
                      {
                        "type": "CVE",
                        "value": "CVE-2019-20149"
                      }
                    ]
                  }
                },
                "vulnerableManifestFilename": "package-lock.json",
                "vulnerableRequirements": "= 6.0.2",
                "vulnerableManifestPath": "package-lock.json"
              }
            }
          ],
          "totalCount": 11
        }
      }
    ]
  }
}
*/

export default function Alerts({ chosenRepos, alerts, setAlerts }) {
  const { access_token } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [showMatching, setShowMatching] = useState(false);
  const [matching, setMatching] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [total, setTotal] = useState(0);
  const [fetched, setFetched] = useState(0);

  useEffect(() => {
    let allAlerts = [];
    let done = false;
    let lastIdx = 0;

    const getAlerts = async () => {
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

        const alerts = nodes.reduce((acc, cv) => {
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
        allAlerts.push(...alerts);
        setFetched(lastIdx);
      }

      lastIdx = 0;
      setAlerts(allAlerts || []);
      setLoading(false);
    };

    getAlerts();
  }, [
    access_token,
    queryGithub,
    chosenRepos,
    setLoading,
    setTotal,
    setFetched,
  ]);

  if (!chosenRepos || chosenRepos.size === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="alerts">
        <h2>Vulnerabily Alerts</h2>
        <div className="loading">
          <p>Fetching vulnerabily alerts</p>
          <Loader total={total} fetched={fetched} />
        </div>
      </div>
    );
  }

  // const reposById = repos.reduce((acc, cv) => {
  //   if (chosenRepos.has(cv.id)) {
  //     acc[cv.id] = cv;
  //   }
  //   return acc;
  // }, {});

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

  const visibleAlerts = () => {
    if (sortBy === 'default' && !showMatching) {
      return alerts;
    }

    const filtered = showMatching
      ? alerts.filter((alert) => {
          if (
            showMatching &&
            alert.title.toLowerCase().includes(matching.toLowerCase())
          ) {
            return true;
          }
          return false;
        })
      : alerts;

    if (sortBy === 'default') {
      return filtered;
    }

    if (sortBy === 'createdAt') {
      return filtered.sort((a, b) => {
        if (a.createdAtInt > b.createdAtInt) {
          return -1;
        }
        if (a.createdAtInt < b.createdAtInt) {
          return 1;
        }
        return 0;
      });
    }

    return filtered.sort((a, b) => {
      if (a.title.toLowerCase() < b.title.toLowerCase()) {
        return -1;
      }
      if (a.title.toLowerCase() > b.title.toLowerCase()) {
        return 1;
      }
      return 0;
    });
  };

  return (
    <div className="alerts">
      <h2>Vulnerabily Alerts</h2>
      <div className="alerts-controls">
        <div>
          Sort:
          <select
            onChange={(e) => {
              setSortBy(e.currentTarget.value);
            }}
            value={sortBy}
          >
            <option value="default">Default</option>
            <option value="createdAt">Alerts newest to oldest</option>
            <option value="name">Alerts name A-Z</option>
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
      {alerts && alerts.length
        ? visibleAlerts().map((alert, idx) => (
            <div key={idx}>{JSON.stringify(alert)}</div>
          ))
        : null}
    </div>
  );
}
