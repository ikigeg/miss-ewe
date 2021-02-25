import styles from './index.module.scss';

export default function Header() {
  return (
    <div className={styles.header}>
      <h1>Miss Ewe</h1>
      <img src="img/missEwe.png" className={styles.logo} />
    </div>
  );
}
