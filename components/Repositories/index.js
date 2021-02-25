import { useEffect, useState } from 'react';
import get from 'lodash/get';

import { useAuthContext } from '../../context/auth';
import queryGithub from '../../utils/queryGithub';

const query = `
  query Repos($cursor: String) {
    viewer {
      login
      name
      repositories(first:100, affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER], after: $cursor, orderBy: {field: NAME, direction: ASC}) {
        totalCount
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            name
            id
            url
            owner {
              login
              avatarUrl
              id
            }
            isFork
            createdAt
          }
        }
      }
    }
  }
`;

export default function Repositories({
  loadingRepos,
  setLoadingRepos,
  repos,
  setRepos,
  chosenRepos,
  setChosenRepos,
}) {
  const { access_token } = useAuthContext();
  const [showSelected, setShowSelected] = useState(null);
  const [showMatching, setShowMatching] = useState(false);
  const [matching, setMatching] = useState('');

  useEffect(() => {
    let allRepos = [];
    let done = false;
    let cursor = undefined;

    const fetchRepos = async () => {
      setLoadingRepos(true);

      while (!done) {
        const data = await queryGithub({
          access_token,
          query,
          variables: { cursor },
        });

        const edges = get(data, 'viewer.repositories.edges', []);

        if (edges.length === 0) {
          done = true;
          continue;
        }

        cursor = edges[edges.length - 1].cursor;
        allRepos.push(...edges.map((e) => e.node));

        if (!get(data, 'viewer.repositories.pageInfo.hasNextPage', false)) {
          done = true;
        }
      }

      setRepos(allRepos || []);
      setLoadingRepos(false);
    };

    if (!repos && !loadingRepos) {
      console.log('fetching repos');
      fetchRepos();
      console.log('fetched repos');
    }
  }, [access_token, queryGithub, setLoadingRepos]);

  if (!access_token || !repos) {
    return <p>Fetching repos</p>;
  }

  const handleClick = (clickedId, selected) => {
    const newRepos = repos.map((repo) => {
      if (repo.id === clickedId) {
        const newRepo = repo;
        newRepo.selected = !newRepo.selected;
        return newRepo;
      }
      return repo;
    });
    setRepos(newRepos);

    const newChosen = new Set([...(chosenRepos || [])]);
    if (!selected) {
      newChosen.add(clickedId);
    } else {
      newChosen.delete(clickedId);
    }
    setChosenRepos(newChosen);
  };

  const selectVisible = (select) => {
    const visible = visibleRepos().map((repo) => repo.id) || [];
    if (!visible) {
      return;
    }

    const newRepos = repos.map((repo) => {
      if (visible.includes(repo.id)) {
        const newRepo = repo;
        newRepo.selected = select || false;
        return newRepo;
      }
      return repo;
    });
    setRepos(newRepos);

    const newChosen = [...(chosenRepos || [])];
    if (select) {
      newChosen.push(...visible);
      setChosenRepos(new Set(newChosen));
    } else {
      setChosenRepos(new Set(newChosen.filter((c) => !visible.includes(c))));
    }
  };

  const visibleRepos = () => {
    if (showSelected === null && !showMatching) {
      return repos;
    }

    return repos.filter((repo) => {
      if (showSelected === true && repo.selected) {
        return true;
      }
      if (showSelected === false && !repo.selected) {
        return true;
      }
      if (
        showMatching &&
        repo.name.toLowerCase().substr(0, matching.length) ===
          matching.toLowerCase()
      ) {
        return true;
      }
      return false;
    });
  };

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

  return (
    <div>
      <h2>
        Repositories - chosen: {chosenRepos.size} of {repos.length}
      </h2>
      <div>
        SELECTED:
        <button type="button" onClick={() => setShowSelected(true)}>
          yes
        </button>
        <button type="button" onClick={() => setShowSelected(false)}>
          no
        </button>
        <button type="button" onClick={() => setShowSelected(null)}>
          all
        </button>
      </div>

      <div>
        <label>
          MATCHING:
          <input type="text" value={matching} onChange={handleMatchingChange} />
        </label>
        <button type="button" onClick={resetMatching}>
          reset
        </button>
      </div>

      <div>
        SET VISIBLE:
        <button type="button" onClick={() => selectVisible(true)}>
          selected
        </button>
        <button type="button" onClick={() => selectVisible(false)}>
          deselected
        </button>
      </div>

      {visibleRepos().map((repo) => (
        <div
          key={repo.id}
          style={{ background: repo.selected ? 'red' : 'transparent' }}
        >
          {JSON.stringify(repo)}
          <button
            type="button"
            onClick={() => handleClick(repo.id, repo.selected)}
          >
            choose
          </button>
        </div>
      ))}
    </div>
  );
}
