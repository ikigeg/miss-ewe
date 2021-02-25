export default function Avatar({ src, alt = '', url }) {
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img
        src={src}
        style={{ height: '3rem', width: 'auto', borderRadius: '100%' }}
        alt={alt}
      />
    </a>
  );
}
