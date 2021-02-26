// import styles from './index.module.scss';

export default function Header() {
  return (
    <div>
      <h1>Miss Ewe</h1>
      <a href="/" title="Home">
        <img
          src="img/missEwe.png"
          style={{
            width: 'auto',
            maxHeight: '10rem',
          }}
        />
      </a>
    </div>
  );
}
