import { useEffect, useState } from 'react';
import get from 'lodash/get';

import { useAuthContext } from '../../context/auth';
import queryGithub from '../../utils/queryGithub';
import Issue from '../Issue';

const query = `
  query OpenIssues($ids: [ID!]!) {
    nodes(ids: $ids) {
      id
      ... on Repository {
        issues(first: 20, states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
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
        console.log({ selectedIds, data, access_token });

        const nodes = get(data, 'nodes', []);
        if (nodes.length === 0) {
          done = true;
          continue;
        }

        lastIdx = lastIdx + 20;

        const issues = nodes.reduce((acc, cv) => {
          const edges = get(cv, 'issues.edges', []);
          acc.push(...edges.map((e) => ({ ...e.node, repoId: cv.id })));
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
    return <p>Choose some repositories to see the issues</p>;
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

  return (
    <div>
      <h2>issuues</h2>
      {loading ? <p>Fetching issues</p> : null}
      {!loading && issues && issues.length
        ? issues.map((issue, idx) => (
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
