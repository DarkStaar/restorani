import axios from "axios";
import { authHeaderConfig, refreshToken, logout } from './utils';
import { omitBy, isNil } from 'lodash';

import {
  RESTAURANTS_URL,
} from "../constants/urls";

/**
 * Api services to manage restaurants
 */
export const fetchRestaurants = async (params = {}) => {
  try {
    params = omitBy(params, isNil);
    const query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    
    const response = await axios.get(`${RESTAURANTS_URL}?${query}`, authHeaderConfig());
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

export const fetchOwnedRestaurants = async (params = {}) => {
  try {
    params = omitBy(params, isNil);
    const query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    
    const response = await axios.get(`${RESTAURANTS_URL}/owned?${query}`, authHeaderConfig());
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


export const fetchRestaurantUsers = async (restaurantId, params = {}) => {
  try {
    params = omitBy(params, isNil);
    const query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    const response = await axios.get(`${RESTAURANTS_URL}/${restaurantId}/users?${query}`, authHeaderConfig());
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

export const fetchRestaurant = async (restaurantId) => {
  try {
    const response = await axios.get(
      `${RESTAURANTS_URL}/${restaurantId}`,
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

export const createRestaurant = async (data) => {
  try {
    const response = await axios.post(RESTAURANTS_URL, data, authHeaderConfig());
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

export const updateRestaurant = async (restaurantId, data) => {
  try {
    const response = await axios.patch(
      `${RESTAURANTS_URL}/${restaurantId}`,
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

export const deleteRestaurant = async (restaurantId) => {
  try {
    const response = await axios.delete(
      `${RESTAURANTS_URL}/${restaurantId}`,
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

export const blockRestaurantUser = async (restaurantId, userId) => {
  try {
    const response = await axios.patch(
      `${RESTAURANTS_URL}/${restaurantId}/block`,
      { userId },
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

export const unblockRestaurantUser = async (restaurantId, userId) => {
  try {
    const response = await axios.patch(
      `${RESTAURANTS_URL}/${restaurantId}/unblock`,
      { userId },
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