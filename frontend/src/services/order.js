import axios from "axios";
import { omitBy, isNil } from 'lodash';
import { authHeaderConfig, refreshToken, logout } from './utils';

import {
  ORDERS_URL,
} from "../constants/urls";

/**
 * Api services to manage orders
 */
export const fetchOrders = async (params = {}) => {
  try {
    params = omitBy(params, isNil);
    const query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    
    const response = await axios.get(`${ORDERS_URL}?${query}`, authHeaderConfig());
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

export const fetchOrder = async (orderId) => {
  try {
    const response = await axios.get(
      `${ORDERS_URL}/${orderId}`,
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

export const createOrder = async (data) => {
  try {
    console.log('ordering');
    const response = await axios.post(ORDERS_URL, data, authHeaderConfig());
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

export const updateOrder = async (orderId, data) => {
  try {
    const response = await axios.patch(
      `${ORDERS_URL}/${orderId}`,
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

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.patch(
      `${ORDERS_URL}/${orderId}/status`,
      { status },
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

export const deleteOrder = async (orderId) => {
  try {
    const response = await axios.delete(
      `${ORDERS_URL}/${orderId}`,
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
