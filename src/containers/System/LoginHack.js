import axios from "axios";

export let accessToken;
export const LoginHack = axios
  .post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
    username: "hduc",

    password: "123456",
  })
  .then(function (response) {
    accessToken = response.data.accessToken;
  })
  .catch(function (error) {
    console.log(error);
  });
