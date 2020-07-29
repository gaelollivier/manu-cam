import Head from 'next/head';
import * as React from 'react';
import useSWR, { SWRConfig } from 'swr';

const LogsQuery = () => {
  const { data } = useSWR('/api/pi-logs', {
    refreshInterval: 1000,
    onError: (error) => {
      console.log({ error });
    },
  });

  const logs = data?.logs
    ?.map(({ time, logs }) => `[${time.replace(/T|Z/g, ' ')}]\n${logs}`)
    .join('\n');

  const logsRef = React.useRef();

  React.useEffect(() => {
    if (logsRef.current) {
      (logsRef.current as any).scrollTop = (logsRef.current as any).scrollHeight;
    }
  });

  return (
    <>
      <div className="container">
        <pre ref={logsRef}>{logs}</pre>
      </div>
      <style jsx>{`
        .container {
          padding: 15px;
        }

        pre {
          width: 100%;
          height: 80vh;
          overflow: auto;
          border: 1px solid grey;
        }
      `}</style>
    </>
  );
};

export default function Logs() {
  const authToken =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('MANUCAM_AUTH')
      : '';

  return (
    <>
      <Head>
        <title>ManuCam</title>
      </Head>
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
        <LogsQuery />
      </SWRConfig>
    </>
  );
}
