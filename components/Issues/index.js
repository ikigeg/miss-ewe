import { useEffect } from 'react';
import get from 'lodash/get';

import queryGithub from '../../utils/queryGithub';

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
              }
              title
              state
              labels(first: 10) {
                totalCount
                edges {
                  node {
                    color
                    name
                  }
                  cursor
                }
              }
              comments {
                totalCount
              }
              createdAt
            }
            cursor
          }
        }
      }
    }
  }  
`;

export default function Issues({
  user,
  access_token,
  fetchIssues,
  setFetchIssues,
  loadingIssues,
  setLoadingIssues,
  chosen,
  issues,
  setIssues,
}) {
  useEffect(() => {
    let allIssues = [];
    let done = false;
    let lastIdx = 0;

    const getIssues = async () => {
      setLoadingIssues(true);

      while (!done) {
        // we take max 20 repo ids at a time
        const selectedIds = [...(chosen || [])].slice(lastIdx, lastIdx + 20);
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
          acc.push(...edges.map((e) => ({ ...e.node, repoId: cv.id })));
          return acc;
        }, []);
        allIssues.push(...issues);
      }

      lastIdx = 0;
      setIssues(allIssues || []);
      setLoadingIssues(false);
      setFetchIssues(false);
    };

    if (fetchIssues && chosen && !issues && !loadingIssues) {
      console.log('fetching issues');
      getIssues();
      console.log('fetched issues');
    }
  }, [user, access_token, queryGithub, fetchIssues, chosen]);

  if ((!fetchIssues && !chosen) || chosen.size === 0) {
    return <p>Choose some repositories to see the issues</p>;
  }

  if (!user || !access_token || !issues) {
    return <p>Fetching issues</p>;
  }

  return (
    <div>
      <h2>issuues</h2>
      {issues.map((issue, idx) => (
        <div
          key={issue.id}
          style={{
            background: idx & 1 ? '#efefef' : 'transparent',
            marginBottom: '4px',
          }}
        >
          {JSON.stringify(issue)}
        </div>
      ))}
    </div>
  );
}
