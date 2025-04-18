import axios from "axios";

export const getAllBusquedas = () => {
  return axios.get("http://127.0.0.1:8000/api/v1/busquedas/");
};

export const getAllBusquedasrrss = () => {
  return axios.get("http://127.0.0.1:8000/api/v1/busquedasrrss/");
};
