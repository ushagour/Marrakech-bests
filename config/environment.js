// Environment configuration for different build types
const ENV = {
  dev: {
    API_URL: 'https://raw.githubusercontent.com/ushagour/apps-assets/main/little-lemon/assets/capstone.json',
    ENABLE_LOGS: true,
  },
  preview: {
    API_URL: 'https://raw.githubusercontent.com/ushagour/apps-assets/main/little-lemon/assets/capstone.json',
    ENABLE_LOGS: true,
  },
  production: {
    API_URL: 'https://raw.githubusercontent.com/ushagour/apps-assets/main/little-lemon/assets/capstone.json',
    ENABLE_LOGS: false,
  },
};

const getEnvVars = () => {
  // Default to production
  let env = ENV.production; 
    if (__DEV__) {
        env = ENV.dev;
    } else if (process.env.BUILD_TYPE === 'preview') {
        env = ENV.preview;
    }
    return env;
};

export default getEnvVars();
