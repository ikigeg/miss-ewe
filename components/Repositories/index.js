import { useEffect, useState } from 'react';
import get from 'lodash/get';

import { useAuthContext } from '../../context/auth';
import queryGithub from '../../utils/queryGithub';
import Repository from '../Repository';

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
  repos,
  setRepos,
  chosenRepos,
  setChosenRepos,
}) {
  const { access_token } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [showSelected, setShowSelected] = useState(null);
  const [showMatching, setShowMatching] = useState(false);
  const [matching, setMatching] = useState('');
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    let allRepos = [];
    let done = false;
    let cursor = undefined;

    const fetchRepos = async () => {
      setLoading(true);

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
      setLoading(false);
    };

    if (!repos && !loading) {
      console.log('fetching repos');
      fetchRepos();
      console.log('fetched repos');
    }
  }, [access_token, queryGithub, setLoading]);

  if (!access_token || !repos) {
    return <p>Fetching repos</p>;
  }

  const handleClick = (clickedId, isSelected) => {
    console.log({ clickedId, isSelected });
    const newRepos = repos.map((repo) => {
      if (repo.id === clickedId) {
        const newRepo = repo;
        newRepo.selected = !newRepo.selected;
        return newRepo;
      }
      return repo;
    });
    setRepos(newRepos);

    const newSelected = new Set([...(selected || [])]);
    if (!isSelected) {
      newSelected.add(clickedId);
    } else {
      newSelected.delete(clickedId);
    }
    setSelected(newSelected);
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

    const newSelected = [...(selected || [])];
    if (select) {
      newSelected.push(...visible);
      setSelected(new Set(newSelected));
    } else {
      setSelected(new Set(newSelected.filter((c) => !visible.includes(c))));
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

  const repoChooser = (
    <>
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
        <Repository key={repo.id} {...repo} onClick={handleClick} />
      ))}
    </>
  );

  const hasChosen = chosenRepos && chosenRepos.size;
  return (
    <div>
      <h2>
        {hasChosen ? (
          <>
            Repositories - {chosenRepos.size} chosen{' '}
            <button
              type="button"
              onClick={() => {
                setChosenRepos(new Set());
              }}
            >
              Change repos
            </button>
          </>
        ) : (
          <>
            Repositories - selected: {selected.size} of {repos.length}{' '}
            <button
              type="button"
              onClick={() => {
                setChosenRepos(new Set([...selected]));
              }}
              disabled={!selected || !selected.size}
            >
              Fetch Issues
            </button>
          </>
        )}
      </h2>
      {!hasChosen ? repoChooser : null}
    </div>
  );
}
