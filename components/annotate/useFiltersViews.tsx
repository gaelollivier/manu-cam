import React from 'react';

const FILTERS_VIEWS = [
  { label: 'All', value: '' },
  { label: 'Missing annotation', value: 'missingAnnotation' },
  { label: 'Missing Bounding Box', value: 'missingBoundingBox' },
  { label: 'Skipped', value: 'skipped' },
  { label: 'Has bounding box', value: 'hasBoundingBox' },
];

export const useFiltersViews = ({
  goToOffset,
}: {
  goToOffset: (offset: number) => void;
}) => {
  const [filtersView, setFiltersView] = React.useState('');

  const handleFiltersViewChange = (newView: string) => {
    setFiltersView(newView);
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
