import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'flareact/router';
import { FallbackStorage } from '@conclurer/local-storage-fallback';
import { nanoid } from 'nanoid';
import qs from 'querystringify';

const storage = new FallbackStorage();

export const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    access_token: null,
    code: null,
    loading: null,
    error: null,
    loginId: storage.getItem('loginId'),
  });

  const router = useRouter();

  const newLoginId = () => {
    const loginId = nanoid();
    storage.setItem('loginId', loginId);
    return loginId;
  };

  useEffect(() => {
    const search = window.location.search || '';
    const hasCode = search.includes('?code=');

    if (hasCode) {
      const params = qs.parse(search);
      setState({ ...state, loading: true });

      if (params.state !== storage.getItem('loginId')) {
        setState({
          ...state,
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
          console.log(installations);
          setState({
            ...state,
            loading: false,
            error: null,
            access_token,
            user,
            code: params.code,
          });
          router.push('/');
        })
        .catch((error) => {
          setState({
            ...state,
            loading: false,
            error,
            access_token: null,
            user: null,
            code: null,
          });
        });
    } else {
      if (state.user === null) {
        setState({ ...state, loginId: newLoginId() });
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
