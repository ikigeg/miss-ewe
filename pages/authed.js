export default function Authed({ user }) {
  if (user) {
    return null;
  }

  return <h1>Processing GitHub authentication...</h1>;
}
