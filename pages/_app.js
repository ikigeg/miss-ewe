import Head from 'flareact/head';

import { AuthContextProvider, AuthContext } from '../context/auth';

export default function App({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <AuthContext.Consumer>
        {(props) => (
          <>
            <Head>
              <title>Miss Ewe</title>
              <meta property="og:title" content="Home | Miss Ewe" key="title" />
              <meta name="robots" content="noindex" />
              <link rel="preconnect" href="https://fonts.gstatic.com" />
              <link
                href="https://fonts.googleapis.com/css2?family=Montserrat+Alternates:wght@400;600&family=Open+Sans:wght@300;400;700&display=swap"
                rel="stylesheet"
              />
            </Head>
            <h1>Miss Ewe</h1>
            <Component {...pageProps} {...props} />
          </>
        )}
      </AuthContext.Consumer>
    </AuthContextProvider>
  );
}
