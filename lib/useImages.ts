import useSWR, { SWRConfig } from 'swr';

export interface File {
  name: string;
  mediaLink: string;
}

export interface Image {
  _id: string;
  time: Date;
  files: {
    small: File;
    large: File;
  };
}

export const useImages = (params: string = ''): { images: Array<Image> } => {
  const { data } = useSWR(`/api/images${params}`, {
    onSuccess: (data) => {
      console.log({ data });
    },
    onError: (error) => {
      console.log({ error });
    },
  });

  return { images: data?.images ?? [] };
};
