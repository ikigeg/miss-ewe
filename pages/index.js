import Main from '../components/Main';

export default function Index({ loading, user }) {
  if (!user) {
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Main />;
}
