import React, { useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import { Link } from "react-router-dom";
import moment from "moment-timezone";
import { fetchOrders, updateOrderStatus } from "../../services";
import { OrderStatus } from "../../constants/constants";
import OrderStatusLabel from "./OrderStatusLabel";
import OrderStatusButton from "./OrderStatusButton";

export default function Orders({ history }) {
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [apiError, setAPIError] = useState(null);
  const [status, setStatus] = useState(0);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  async function fetchData() {
    try {
      const data = await fetchOrders({ page, perPage, status });
      setOrders(data.orders);
      setTotal(data.total);
      setPage(data.page);
      setLoaded(true);
    } catch (e) {
      setAPIError(e.message);
    }
  }

  useEffect(() => {
    fetchData();
  }, [page, perPage, status]);

  async function updateStatus(order, nextStatus) {
    try {
      const response = await updateOrderStatus(order.id, nextStatus);
      const savedOrder = response;
      const newOrders = orders.map((x) =>
        x.id === savedOrder.id ? savedOrder : x
      );
      setOrders(newOrders);

    } catch (e) {
      setAPIError(e.message);
      fetchData();
      console.log(e);
    }
  }

  const onClickOrder = (orderId) => {
    history.push(`/orders/${orderId}`);
  };

  const startIndex = Math.min(perPage * (page - 1) + 1, total);
  const endIndex = Math.min(startIndex + perPage - 1, total);

  const renderTable = () => {
    return (
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Restaurant Name</th>
            <th>Order Detail</th>
            <th>Order Total</th>
            <th>Order Status</th>
            <th>Ordered Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders &&
            orders.map((order, idx) => (
              <tr
                className="cursor-pointer"
                key={order.id}
                onClick={() => onClickOrder(order.id)}
              >
                <th>{startIndex + idx}</th>
                <td>{order.restaurant.name}</td>
                <td>
                  {order.meals.map((meal, idx) => (
                    <div key={idx}>
                      {meal.name} &nbsp; x{meal.count}
                    </div>
                  ))}
                </td>
                <td>{order.total.toFixed(2)}</td>
                <td>
                  <OrderStatusLabel status={order.status} />
                </td>
                <td>{moment(order.createdAt).format("MMMM D YYYY")}</td>
                <td>
                  <OrderStatusButton
                    status={order.status}
                    onClick={(status) => {
                      updateStatus(order, status);
                    }}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-12">
          {apiError && <div className="alert alert-danger">{apiError}</div>}
          <div className="card">
            <div className="card-header">
              <h4 className="pt-2">My Orders</h4>
              <div className="clearfix pt-3">
                <div className=" float-left form-group ">
                  <select
                    className="selectpicker form-control"
                    title="Filter by status"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option>Filter by order status</option>

                    <option value={OrderStatus.Placed}>Placed</option>
                    <option value={OrderStatus.Processing}>Processing</option>
                    <option value={OrderStatus.InRoute}>In Route</option>
                    <option value={OrderStatus.Delivered}>Delivered</option>
                    <option value={OrderStatus.Received}>Received</option>
                    <option value={OrderStatus.Canceled}>Canceled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="">{renderTable()}</div>

              {!apiError && loaded && orders.length === 0 && (
                <div className="text-center">
                  {status === 0
                    ? "There are no orders yet."
                    : "No orders found."}
                </div>
              )}
            </div>
            <div className="card-footer">
              <div className="float-right"></div>

              <Pagination
                itemClass="page-item"
                linkClass="page-link"
                innerClass="pagination float-right"
                prevPageText="‹"
                nextPageText="›"
                activePage={page}
                itemsCountPerPage={perPage}
                totalItemsCount={total}
                pageRangeDisplayed={5}
                onChange={(p) => setPage(p)}
              />
              <div className="float-right mx-4 mt-2">
                Showing ({startIndex} - {endIndex}) / {total}
              </div>
              <div className="float-right mr-2 mt-1">
                Show per page &nbsp;
                <select
                  className="form-control-sm"
                  value={perPage}
                  onChange={(event) => {
                    setPerPage(parseInt(event.target.value));
                    setPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
