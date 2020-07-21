import Head from 'next/head';
import useSWR, { SWRConfig } from 'swr';

interface File {
  mediaLink: string;
}

interface Image {
  _id: string;
  time: Date;
  files: {
    small: File;
    large: File;
  };
}

const useImages = (): { images: Array<Image> } => {
  const { data } = useSWR('/api/images', {
    onSuccess: (data) => {
      console.log({ data });
    },
    onError: (error) => {
      console.log({ error });
    },
  });

  return { images: data?.images ?? [] };
};

const Images = () => {
  const { images } = useImages();

  const latestImage = images[0]?.files;

  return (
    <>
      {latestImage && (
        <>
          <img src={latestImage.large.mediaLink} />
          <img src={latestImage.small.mediaLink} />
        </>
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
