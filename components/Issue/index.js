import { Link, MessageSquare } from 'react-feather';

import Avatar from '../Avatar';

export default function Issue({
  id,
  url,
  bodyHTML,
  author,
  title,
  labels,
  comments,
  createdAt,
  repo,
  idx,
}) {
  console.log(labels);
  const prettyLabels =
    labels && labels.totalCount
      ? labels.edges.map(({ node: { color, name, id } }) => (
          <span
            key={id}
            className="label"
            style={{
              borderRadius: '10px',
              borderWidth: '1px',
              borderColor: `#${color}`,
              borderStyle: 'solid',
              padding: '2px 4px',
              margin: '0px 2px',
            }}
          >
            {name}
          </span>
        ))
      : null;

  return (
    <div
      style={{
        background: idx & 1 ? '#efefef' : 'transparent',
        marginBottom: '4px',
      }}
    >
      <div className="issueTitle">
        <span title={repo.id}>{repo.name}</span>
        <a href={repo.url} target="_blank" rel="noreferrer">
          <Link />
        </a>
        <span title={id}>{title}</span>
        <a href={url} target="_blank" rel="noreferrer">
          <Link />
        </a>
        {prettyLabels}
        <Avatar src={author.avatarUrl} url={author.url} alt={author.login} />
        <span>{createdAt}</span>
        <span>
          <MessageSquare />
          {comments.totalCount || 0}
        </span>
      </div>
      <div className="issueBody">
        <div
          dangerouslySetInnerHTML={{
            __html: bodyHTML,
          }}
        ></div>
      </div>
    </div>
  );
}
