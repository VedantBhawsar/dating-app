// app.config.js
// The 'config' parameter is automatically passed by Expo CLI,
// containing the configuration from app.json's "expo" key.
module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...(config.android || {}),
      permissions: [
        "INTERNET",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "CAMERA"
      ],
      softwareKeyboardLayoutMode: "pan"
    }
  };
};
