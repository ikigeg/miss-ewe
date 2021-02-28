import { Link } from 'react-feather';

export default function Repository({
  name,
  id,
  url,
  isFork,
  selected,
  onClick,
}) {
  return (
    <div
      onClick={() => onClick(id, selected)}
      style={{ background: selected ? 'red' : 'transparent' }}
    >
      <span title={id}>{name}</span>
      <a href={url} target="_blank" rel="noreferrer">
        <Link />
      </a>
      {isFork ? <span className="isFork">fork</span> : null}
    </div>
  );
}
