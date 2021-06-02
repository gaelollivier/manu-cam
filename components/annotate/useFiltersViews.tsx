import { useRouter } from 'next/router';
import React from 'react';

const FILTERS_VIEWS = [
  { label: 'All', value: '' },
  { label: 'Missing annotation', value: 'missingAnnotation' },
  { label: 'Missing Bounding Box', value: 'missingBoundingBox' },
  { label: 'Skipped', value: 'skipped' },
  { label: 'Has bounding box', value: 'hasBoundingBox' },
  { label: 'Has multiple bounding boxes', value: 'hasMultipleBoundingBoxes' },
];

export const useFiltersViews = ({
  goToOffset,
}: {
  goToOffset: (offset: number) => void;
}) => {
  const router = useRouter();
  const filtersView = router.query.filtersView ?? '';

  const handleFiltersViewChange = (newView: string) => {
    router.push({
      pathname: router.pathname,
      query: { filtersView: newView },
    });
    goToOffset(0);
  };

  const filtersViewControls = (
    <select
      onChange={(e) => handleFiltersViewChange(e.target.value)}
      value={filtersView}
    >
      {FILTERS_VIEWS.map(({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );

  return { filtersView, filtersViewControls };
};
