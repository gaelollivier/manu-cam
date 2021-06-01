import React from 'react';

export const useAnnotationSettings = () => {
  const [settings, setSettings] = React.useState({
    aiBox: false,
    annotatedBox: true,
    autoNextOnBoundingBox: false,
  });

  const handleSettingToggle =
    (settingKey: keyof typeof settings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setSettings((settings) => ({
        ...settings,
        [settingKey]: checked,
      }));
    };

  const settingsControls = (
    <>
      <li>
        <label>
          <input
            type="checkbox"
            checked={settings.aiBox}
            onChange={handleSettingToggle('aiBox')}
          />{' '}
          Show AI Box
        </label>
      </li>
      <li>
        <label>
          <input
            type="checkbox"
            checked={settings.annotatedBox}
            onChange={handleSettingToggle('annotatedBox')}
          />{' '}
          Show Annotated Box
        </label>
      </li>
      <li>
        <label>
          <input
            type="checkbox"
            checked={settings.autoNextOnBoundingBox}
            onChange={handleSettingToggle('autoNextOnBoundingBox')}
          />{' '}
          Auto Next on Bounding Box
        </label>
      </li>
    </>
  );

  return {
    settings,
    settingsControls,
  };
};
