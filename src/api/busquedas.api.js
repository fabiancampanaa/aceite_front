import axios from "axios";

export const getAllBusquedas = () => {
  return axios.get("http://localhost/api/v1/busquedas/");
};

export const getAllBusquedasrrss = () => {
  return axios.get("http://localhost/api/v1/busquedasrrss/");
};
