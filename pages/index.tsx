import Head from 'next/head';
import useSWR, { SWRConfig } from 'swr';

const Images = () => {
  const { data, error } = useSWR('/api/images');

  const latestImageId = data?.images[0].fileId;

  return (
    <>
      <pre style={{ height: 300, overflowY: 'auto' }}>
        {JSON.stringify({ data, error }, null, 4)}
      </pre>
      {latestImageId && (
        <img
          width="500"
          src={`https://storage.googleapis.com/manu-cam-images/${latestImageId}`}
        />
      )}
    </>
  );
};

export default function Home() {
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
        <Images />
      </SWRConfig>
    </>
  );
}
