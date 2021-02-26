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

/*
{"name":"kafka-visualiser","id":"MDEwOlJlcG9zaXRvcnkzMTI1MzE5MDM=","url":"https://github.com/ikigeg/kafka-visualiser",
"owner":{"login":"ikigeg","avatarUrl":"https://avatars.githubusercontent.com/u/8846301?u=fda06803fbdc092e59b824d65012748f38332b13&v=4",
"id":"MDQ6VXNlcjg4NDYzMDE="},"isFork":true,"createdAt":"2020-11-13T09:34:35Z","selected":false}
*/
