import Head from 'next/head';
import useSWR, { SWRConfig } from 'swr';

const Images = () => {
  const { data } = useSWR('/api/images', {
    onSuccess: (data) => {
      console.log({ data });
    },
    onError: (error) => {
      console.log({ error });
    },
  });

  const latestImageUrl = data?.images[0]?.file.mediaLink;

  return <>{latestImageUrl && <img width="500" src={latestImageUrl} />}</>;
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
