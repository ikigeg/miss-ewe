import { useState } from 'react';
import { File } from 'react-feather';
import * as timeago from 'timeago.js';
import ReactMarkdown from 'react-markdown';

import './style.css';

export default function DependabotAlert({
  id,
  createdAt,
  dismissedAt,
  repo,
  securityVulnerability,
  vulnerableManifestFilename,
  dismisser,
}) {
  const [expanded, setExpanded] = useState(false);
  const url = `${repo.url}/security/dependabot/${vulnerableManifestFilename}/${
    securityVulnerability.package.name
  }/${dismissedAt ? 'closed' : 'open'}`;

  const prettySeverity = (severity) => {
    let color = 'b1bac4';
    if (severity === 'MODERATE') {
      color = 'e3b341';
    } else if (severity === 'HIGH') {
      color = 'db6d28';
    }
    return (
      <span
        key={id}
        className="severity"
        style={{
          borderColor: `#${color}`,
          color: `#${color}`,
        }}
      >
        {severity.toLowerCase()} severity
      </span>
    );
  };

  return (
    <div className="dependabot-alert" onClick={() => setExpanded(!expanded)}>
      <div className="dependabot-alert-title">
        <div className="dependabot-alert-title-severity">
          <a
            className="dependabot-alert-link"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            <span title={id}>{securityVulnerability.package.name}</span>
          </a>
          {prettySeverity(securityVulnerability.severity)}
        </div>
        <div className="dependabot-alert-summary">
          {securityVulnerability.advisory.summary}
        </div>
        <div className="dependabot-alert-meta">
          {dismissedAt ? (
            <>
              Dismissed {timeago.format(dismissedAt)} by{' '}
              <a
                className="author-link"
                href={dismisser && dismisser.url}
                target="_blank"
                rel="noreferrer"
              >
                {dismisser && dismisser.login}
              </a>
            </>
          ) : (
            <>Created {timeago.format(createdAt)}</>
          )}{' '}
          in{' '}
          <a className="repo-link" href={url} target="_blank" rel="noreferrer">
            {repo.name}
          </a>
          <span className="dependabot-alert-location">
            <File
              style={{
                verticalAlign: 'middle',
                height: '1.8rem',
                width: '1.8rem',
              }}
            />
            {vulnerableManifestFilename}
          </span>
        </div>
      </div>
      {expanded ? (
        <div className="dependabot-alert-body">
          <ReactMarkdown>
            {securityVulnerability.advisory.description}
          </ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}
