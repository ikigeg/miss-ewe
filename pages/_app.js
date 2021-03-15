import Head from 'flareact/head';

import { AuthContextProvider, AuthContext } from '../context/auth';
import Header from '../components/Header';

import './_app.scss';

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
              <link
                rel="apple-touch-icon"
                sizes="180x180"
                href="/apple-touch-icon.png"
              />
              <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href="/favicon-32x32.png"
              />
              <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href="/favicon-16x16.png"
              />
              <link rel="manifest" href="/site.webmanifest" />
              <link
                rel="mask-icon"
                href="/safari-pinned-tab.svg"
                color="#00cc00"
              />
              <meta name="apple-mobile-web-app-title" content="Miss Ewe" />
              <meta name="application-name" content="Miss Ewe" />
              <meta name="msapplication-TileColor" content="#00cc00" />
              <meta name="theme-color" content="#00cc00" />
              <link rel="preconnect" href="https://fonts.gstatic.com" />
              <link
                href="https://fonts.googleapis.com/css2?family=Montserrat+Alternates:wght@400;600&family=Open+Sans:wght@300;400;700&display=swap"
                rel="stylesheet"
              />
              <meta property="og:title" content="Miss Ewe - Github Helper" />
              <meta
                property="og:description"
                content="Review issues and dependabot alerts for multiple repositories at once"
              />
              <meta property="og:type" content="website" />
              <meta property="og:image" content="/missEweOgMeta.png" />
            </Head>
            <Header {...pageProps} {...props} />
            <Component {...pageProps} {...props} />
          </>
        )}
      </AuthContext.Consumer>
    </AuthContextProvider>
  );
}
