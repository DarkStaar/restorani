import axios from "axios";
import { omitBy, isNil } from "lodash";
import { MEALS_URL } from "../constants/urls";
import { authHeaderConfig, refreshToken, logout } from './utils';

/**
 * Api services to manage meals
 */
export const fetchMeals = async (params = {}) => {
  try {
    params = omitBy(params, isNil);
    const query = Object.keys(params)
      .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
      .join("&");

    const response = await axios.get(
      `${MEALS_URL}?${query}`,
      authHeaderConfig()
    );
    refreshToken();
    return response.data;
  } catch (e) {
    if (e.response.status === 401) {
      logout();
    }
    const message = e.response ? e.response.data.message : e.message;
    throw new Error(message);
  }
};

export const fetchMeal = async (mealId) => {
  try {
    const response = await axios.get(
      `${MEALS_URL}/${mealId}`,
      authHeaderConfig()
    );
    refreshToken();
    return response.data;
  } catch (e) {
    if (e.response.status === 401) {
      logout();
    }
    const message = e.response ? e.response.data.message : e.message;
    throw new Error(message);
  }
};

export const createMeal = async (data) => {
  try {
    const response = await axios.post(MEALS_URL, data, authHeaderConfig());
    refreshToken();
    return response.data;
  } catch (e) {
    if (e.response.status === 401) {
      logout();
    }
    const message = e.response ? e.response.data.message : e.message;
    throw new Error(message);
  }
};

export const updateMeal = async (mealId, data) => {
  try {
    const response = await axios.patch(
      `${MEALS_URL}/${mealId}`,
      data,
      authHeaderConfig()
    );
    refreshToken();
    return response.data;
  } catch (e) {
    if (e.response.status === 401) {
      logout();
    }
    const message = e.response ? e.response.data.message : e.message;
    throw new Error(message);
  }
};

export const deleteMeal = async (mealId) => {
  try {
    const response = await axios.delete(
      `${MEALS_URL}/${mealId}`,
      authHeaderConfig()
    );
    refreshToken();
    return response.data;
  } catch (e) {
    if (e.response.status === 401) {
      logout();
    }
    const message = e.response ? e.response.data.message : e.message;
    throw new Error(message);
  }
};
