import { useState } from 'react';
import { MessageSquare } from 'react-feather';
import * as timeago from 'timeago.js';
import ReactMarkdown from 'react-markdown';

import './style.css';

export default function Issue({
  id,
  number,
  url,
  body,
  author,
  title,
  labels,
  comments,
  createdAt,
  repo,
}) {
  const [expanded, setExpanded] = useState(false);

  const prettyLabels =
    labels && labels.totalCount
      ? labels.edges.map(({ node: { color, name, id } }) => (
          <span
            key={id}
            className="label"
            style={{
              borderColor: `#${color}`,
            }}
          >
            {name}
          </span>
        ))
      : null;

  return (
    <div className="issue" onClick={() => setExpanded(!expanded)}>
      <div className="issueTitle">
        <div className="issue-title-labels-comments">
          <div className="title-labels">
            <a
              className="issue-link"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              <span title={id}>{title}</span>
            </a>
            {prettyLabels}
          </div>
          <div className="comments">
            <MessageSquare
              style={{
                verticalAlign: 'middle',
                height: '1.8rem',
                width: '1.8rem',
              }}
            />
            {comments.totalCount || 0}
          </div>
        </div>
        <div className="issue-meta">
          #{number} opened {timeago.format(createdAt)} by{' '}
          <a
            className="author-link"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            {author.login}
          </a>{' '}
          in{' '}
          <a className="repo-link" href={url} target="_blank" rel="noreferrer">
            {repo.name}
          </a>
        </div>
      </div>
      {expanded ? (
        <div className="issueBody">
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}
