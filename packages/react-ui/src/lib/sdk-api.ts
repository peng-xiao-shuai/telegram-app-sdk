/**
 * 发起 fetch 请求
 * @param {string} url
 * @param {object} data
 * @returns Promise<T>
 */
export const fetchRequest: <T>(
  url: string,
  data: object,
  init?: RequestInit
) => Promise<T> = async (url: string, data: object, init = {}) => {
  try {
    const response = await (
      await fetch(import.meta.env.VITE_APP_API_BASE + url, {
        method: 'POST',
        body: JSON.stringify(data || {}),
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.TG_SDK_CORE?.Token}`,
          ...(init.headers || {}),
        },
      })
    ).json();

    return response;
  } catch (error) {
    throw window.TG_SDK_CORE.onError('UI API', error);
  }
};
