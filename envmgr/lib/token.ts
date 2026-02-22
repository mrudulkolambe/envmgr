import Cookies from "js-cookie";

export const TOKEN_KEY = "auth_token";

export const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7 }); // 7 days
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};
