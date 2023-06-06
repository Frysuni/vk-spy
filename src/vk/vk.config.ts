import { from } from 'env-var';

export const VkConfig = () => {
  const env = from(process.env);

  return {
    vk: {
      login:    env.get('VK_LOGIN')   .required().asString(),
      password: env.get('VK_PASSWORD').required().asString(),
      suspectUserSearchQuery: env.get('VK_SUSPECT_USER_SEARCH_QUERY').required().asString(),
    },
  };
};