import { from } from 'env-var';

export const TgConfig = () => {
  const env = from(process.env);

  return {
    tg: {
      token: env.get('TG_BOT_TOKEN').required().asString(),
      adminUsername: env.get('TG_ADMIN_USERNAME').required().asString(),
    },
  };
};