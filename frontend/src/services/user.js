import axios from "axios";
import { authHeaderConfig, refreshToken, logout } from './utils';
import { omitBy, isNil } from 'lodash';

import {
  USERS_URL,
  PROFILE_URL
} from "../constants/urls";

/**
 * Api services to manage Users
 */
export const fetchUsers = async (params = {}) => {
  try {
    params = omitBy(params, isNil);
    const query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    const response = await axios.get(`${USERS_URL}?${query}`, authHeaderConfig());
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


export const fetchUser = async (userId) => {
  try {
    const response = await axios.get(
      `${USERS_URL}/${userId}`,
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

export const createUser = async (data) => {
  try {
    const response = await axios.post(USERS_URL, data, authHeaderConfig());
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

export const updateUser = async (userId, data) => {
  try {
    const response = await axios.patch(
      `${USERS_URL}/${userId}`,
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

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(
      `${USERS_URL}/${userId}`,
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

export const updateProfile = async (data) => {
  try {
    const response = await axios.patch(
      PROFILE_URL,
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