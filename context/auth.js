import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'flareact/router';
import { FallbackStorage } from '@conclurer/local-storage-fallback';
import { nanoid } from 'nanoid';
import qs from 'querystringify';

const storage = new FallbackStorage();

export const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    access_token: null,
    code: null,
    loading: null,
    error: null,
    loginId: storage.getItem('loginId'),
    installations: null,
    installationId: null,
    installationToken: null,
  });

  const router = useRouter();

  const newLoginId = () => {
    const loginId = nanoid();
    storage.setItem('loginId', loginId);
    return loginId;
  };

  const setInstallationId = (installationId) =>
    setAuth({ ...auth, installationId });

  const setInstallationToken = (installationToken) =>
    setAuth({ ...auth, installationToken });

  useEffect(() => {
    const search = window.location.search || '';
    const hasCode = search.includes('?code=');

    if (hasCode) {
      const params = qs.parse(search);
      setAuth({ ...auth, loading: true });

      if (params.state !== storage.getItem('loginId')) {
        setAuth({
          ...auth,
          loading: false,
          error: 'Unexpected loginId',
          access_token: null,
          user: null,
          code: null,
        });
        return;
      }

      fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ code: params.code, state: params.state }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(({ access_token, user, installations }) => {
          setAuth({
            ...auth,
            loading: false,
            error: null,
            access_token,
            user,
            code: params.code,
            installations,
          });
          router.push('/');
        })
        .catch((error) => {
          setAuth({
            ...auth,
            loading: false,
            error,
            access_token: null,
            user: null,
            code: null,
            installations: null,
          });
        });
    } else {
      if (auth.user === null) {
        setAuth({ ...auth, loginId: newLoginId() });
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        setInstallationId,
        setInstallationToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
