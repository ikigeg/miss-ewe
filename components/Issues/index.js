import { useEffect, useState } from 'react';
import get from 'lodash/get';

import { useAuthContext } from '../../context/auth';
import queryGithub from '../../utils/queryGithub';
import Issue from '../Issue';

import './style.css';

const query = `
  query OpenIssues($ids: [ID!]!) {
    nodes(ids: $ids) {
      id
      ... on Repository {
        name
        issues(first: 20, states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
              number
              url
              author {
                avatarUrl
                login
                url
              }
              title
              state
              labels(first: 10) {
                totalCount
                edges {
                  node {
                    color
                    name
                    id
                  }
                  cursor
                }
              }
              comments {
                totalCount
              }
              createdAt
              body
              bodyHTML
            }
            cursor
          }
        }
      }
    }
  }
`;

export default function Issues({ chosenRepos, issues, setIssues, repos }) {
  const { access_token } = useAuthContext();

  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showMatching, setShowMatching] = useState(false);
  const [matching, setMatching] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    let allIssues = [];
    let done = false;
    let lastIdx = 0;

    const getIssues = async () => {
      setLoading(true);

      while (!done) {
        // we take max 20 repo ids at a time
        const selectedIds = [...(chosenRepos || [])].slice(
          lastIdx,
          lastIdx + 20
        );
        if (!selectedIds || selectedIds.length === 0) {
          done = true;
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
          continue;
        }

        lastIdx = lastIdx + 20;

        const issues = nodes.reduce((acc, cv) => {
          const edges = get(cv, 'issues.edges', []);
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
        allIssues.push(...issues);
      }

      lastIdx = 0;
      setIssues(allIssues || []);
      setLoading(false);
    };

    getIssues();
  }, [access_token, queryGithub, chosenRepos, setLoading]);

  if (!chosenRepos || chosenRepos.size === 0) {
    return null;
  }

  if (loading) {
    return <p>Fetching issues</p>;
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

  const visibleIssues = () => {
    if (sortBy === 'default' && !showMatching) {
      return issues;
    }

    const filtered = showMatching
      ? issues.filter((issue) => {
          if (
            showMatching &&
            issue.title.toLowerCase().includes(matching.toLowerCase())
          ) {
            return true;
          }
          return false;
        })
      : issues;

    if (sortBy === 'default') {
      return filtered;
    }

    if (sortBy === 'issueCreated') {
      return filtered.sort((a, b) => {
        if (a.createdAtInt < b.createdAtInt) {
          return -1;
        }
        if (a.createdAtInt > b.createdAtInt) {
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

  if (loading) {
    return (
      <div className="issues">
        <h2>Issues</h2>
        <p>Fetching issues</p>
      </div>
    );
  }

  return (
    <div className="issues">
      <h2>Issues</h2>
      <div className="issue-controls">
        <div>
          Sort:
          <select
            onChange={(e) => {
              setSortBy(e.currentTarget.value);
            }}
            value={sortBy}
          >
            <option value="default">Repo A-Z - Issues newest to oldest</option>
            <option value="issueCreated">Issues newest to oldest</option>
            <option value="issueName">Issue name A-Z</option>
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
      {issues && issues.length
        ? visibleIssues().map((issue, idx) => (
            <Issue
              key={issue.id}
              idx={idx}
              {...issue}
              repo={reposById[issue.repoId]}
            />
          ))
        : null}
    </div>
  );
}
