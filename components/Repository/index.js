import { Link } from 'react-feather';

import './style.css';

export default function Repository({
  name,
  id,
  url,
  isFork,
  selected,
  onClick,
  className,
}) {
  return (
    <div
      onClick={() => onClick(id, selected)}
      className={`${className} ${selected ? 'chosen' : ''}`}
    >
      <span title={id}>{name}</span>
      <a href={url} target="_blank" rel="noreferrer">
        <Link />
      </a>
      {isFork ? <span className="isFork">fork</span> : null}
    </div>
  );
}
