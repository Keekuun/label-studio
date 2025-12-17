import rawFeatureFlags from "../../../../../label_studio/feature_flags.json";

const embedFeatureFlags = () => {
  // @ts-ignore
  window.FEATURE_FLAGS = window.FEATURE_FLAGS ?? {};
  const featureFlags = JSON.parse(JSON.stringify(rawFeatureFlags));

  for (const flag of Object.values(featureFlags.flags)) {
    // @ts-ignore
    window.FEATURE_FLAGS[flag.key] = flag.on;
  }
};

embedFeatureFlags();


