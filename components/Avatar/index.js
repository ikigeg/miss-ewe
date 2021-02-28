import './style.css';

export default function Avatar({ src, alt = '', url }) {
  return (
    <a className="avatar" href={url} target="_blank" rel="noreferrer">
      <img src={src} className="avatar-img" alt={alt} />
    </a>
  );
}
