import { SWRConfig } from 'swr';

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  const authToken =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('MANUCAM_AUTH')
      : '';

  return (
    <SWRConfig
      value={{
        fetcher: (input: RequestInfo, init?: RequestInit) =>
          fetch(input, {
            ...(init ?? {}),
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }).then((res) => res.json()),
      }}
    >
      {children}
    </SWRConfig>
  );
};
