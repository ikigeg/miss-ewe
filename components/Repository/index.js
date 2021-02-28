import { Link } from 'react-feather';

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
      <a
        className="repository-link"
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        <Link style={{ width: '1.8rem', height: '1.8rem' }} />
      </a>
      {isFork ? <span className="isFork">(fork)</span> : null}
    </div>
  );
}
