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
  annotations?: {
    hasManu?: boolean;
    boundingBox?: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
  };
  manuDetection?: {
    score: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

interface ImagesByHour {
  hour: string;
  count: number;
}

export const useImages = (
  params: string = ''
): { images: Array<Image>; imagesByHour: Array<ImagesByHour> } => {
  const { data } = useSWR(`/api/images${params}`, {
    onSuccess: (data) => {
      console.log({ data });
    },
    onError: (error) => {
      console.log({ error });
    },
  });

  return { images: data?.images ?? [], imagesByHour: data?.imagesByHour ?? [] };
};
