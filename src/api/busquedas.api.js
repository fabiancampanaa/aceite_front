import axios from "axios";

export const getAllBusquedas = () => {
  return axios.get("https://aceitesdo.cl/api/v1/busquedas");
};

export const getAllBusquedasrrss = () => {
  return axios.get("https://aceitesdo.cl/api/v1/busquedasrrss");
};
