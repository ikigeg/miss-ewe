import { useEffect, useState } from 'react';

import { useAuthContext } from '../../context/auth';
import queryInstallationRepos from '../../utils/queryInstallationRepos';
import Repository from '../Repository';
import Loader from '../Loader';

import './style.css';

export default function Repositories({
  repos,
  setRepos,
  chosenRepos,
  chooseRepos,
  hasChosen,
  resetRepos,
  viewIssues,
  viewDependabotAlerts,
}) {
  const { access_token, installationId } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [showSelected, setShowSelected] = useState('all');
  const [showMatching, setShowMatching] = useState(false);
  const [matching, setMatching] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [total, setTotal] = useState(0);
  const [fetched, setFetched] = useState(0);
  const [className, setClassName] = useState('repositories');

  useEffect(() => {
    let allRepos = [];
    let done = false;
    let page = 1;

    const fetchRepos = async () => {
      setLoading(true);

      while (!done) {
        const { total_count, repositories } = await queryInstallationRepos({
          access_token,
          installationId,
          page,
        });

        if (page === 1) {
          setTotal(total_count);
        }

        if (total_count === 0 || !repositories || !repositories.length) {
          done = true;
          continue;
        }

        const batch = repositories.map((r) => ({
          name: r.name,
          id: r.node_id,
          url: r.html_url,
          owner: {
            login: r.owner.login,
            avatarUrl: r.owner.avatar_url,
            id: r.owner.node_id,
          },
          isFork: r.fork,
          createdAt: r.created_at,
        }));
        allRepos.push(...batch);
        setFetched(allRepos.length);

        page += 1;
        if (allRepos.length >= total_count) {
          done = true;
        }
      }

      setRepos(allRepos || []);
      setLoading(false);
    };

    if (!repos && !loading) {
      fetchRepos();
    }
  }, [
    installationId,
    access_token,
    queryInstallationRepos,
    setLoading,
    setTotal,
    setFetched,
    repos,
  ]);

  useEffect(() => {
    if (hasChosen) {
      setClassName('repositories chosen');
    } else {
      setClassName('repositories');
    }
  }, [hasChosen]);

  if (!installationId || !access_token || !repos) {
    return (
      <div className="repositories">
        <h2>Repositories</h2>
        <p>Fetching repos</p>
        <Loader total={total} fetched={fetched} />
      </div>
    );
  }

  const handleClick = (clickedId, isSelected) => {
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
    if (showSelected === 'all' && !showMatching) {
      return repos;
    }

    return repos.filter((repo) => {
      if (showSelected === 'selected' && repo.selected) {
        return true;
      }
      if (showSelected === 'notSelected' && !repo.selected) {
        return true;
      }
      if (
        showMatching &&
        repo.name.toLowerCase().includes(matching.toLowerCase())
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
        Show:
        <select
          onChange={(e) => {
            setShowSelected(e.currentTarget.value);
          }}
          value={showSelected}
        >
          <option value="all">All</option>
          <option value="selected">Selected</option>
          <option value="notSelected">Not selected</option>
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

      <div>
        Bulk action:
        <button type="button" onClick={() => selectVisible(true)}>
          Select all visible
        </button>
        <button type="button" onClick={() => selectVisible(false)}>
          Deselect all visible
        </button>
      </div>

      {visibleRepos().map((repo) => (
        <Repository
          key={repo.id}
          {...repo}
          onClick={handleClick}
          className="repository clickable"
        />
      ))}
    </>
  );

  if (hasChosen) {
    return (
      <div className={className}>
        <h2>
          Repositories - {chosenRepos.size} chosen{' '}
          <button
            type="button"
            onClick={() => {
              resetRepos();
            }}
          >
            Change repos
          </button>
          <button type="button" onClick={viewIssues}>
            View Issues
          </button>
          <button type="button" onClick={viewDependabotAlerts}>
            View Dependabot Alerts
          </button>
        </h2>
      </div>
    );
  }

  return (
    <div className="repositories">
      <h2>
        Repositories - selected: {selected.size} of {repos.length}{' '}
        <button
          type="button"
          onClick={() => {
            viewIssues();
            chooseRepos(selected);
          }}
          disabled={!selected || !selected.size}
        >
          Fetch Issues
        </button>
        <button
          type="button"
          onClick={() => {
            viewDependabotAlerts();
            chooseRepos(selected);
          }}
          disabled={!selected || !selected.size}
        >
          Fetch Dependabot Alerts
        </button>
      </h2>
      {repoChooser}
    </div>
  );
}
