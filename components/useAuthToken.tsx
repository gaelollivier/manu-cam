import React from 'react';

export const useAuthToken = () => {
  const localStorage =
    typeof window !== 'undefined'
      ? window.localStorage
      : { getItem: () => '', setItem: () => {} };

  const [authToken, setAuthToken] = React.useState(
    localStorage.getItem('MANU_AUTH_TOKEN')
  );

  return {
    authToken,
    authField: (
      <input
        value={authToken ?? ''}
        onChange={(e) => {
          setAuthToken(e.target.value);
          localStorage.setItem('MANU_AUTH_TOKEN', e.target.value);
        }}
      />
    ),
  };
};
