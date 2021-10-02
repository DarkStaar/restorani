import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchOrder, updateOrderStatus } from "../../services";
import { OrderStatus } from "../../constants/constants";
import OrderStatusLabel from "./OrderStatusLabel";
import OrderStatusButton from "./OrderStatusButton";
import moment from "moment-timezone";

export default function ManageOrder({ history }) {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [apiError, setAPIError] = useState(null);

  async function fetchOrderData() {
    if (!orderId) {
      history.goBack();
    }
    try {
      const data = await fetchOrder(orderId);
      setOrder(data);
    } catch (e) {
      history.goBack();
    }
  }

  async function updateStatus(nextStatus) {
    try {

      await updateOrderStatus(order.id, nextStatus);
      await fetchOrderData();

    } catch (e) {
      setAPIError(e.message);
      fetchOrderData();
    }
  }

  useEffect(() => {
    fetchOrderData();
  }, []);


  const renderOrderItemTable = () => {
    return (
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Meal Name</th>
            <th>Quantity</th>
            <th>Price($)</th>
            <th>Amount($)</th>
          </tr>
        </thead>
        <tbody>
          {order &&
            order.meals.map((meal, idx) => (
              <tr key={meal.id}>
                <th>{idx + 1}</th>
                <td>{meal.name}</td>
                <td>{meal.count}</td>
                <td>{meal.price.toFixed(2)}</td>
                <td>{(meal.price * meal.count).toFixed(2)}</td>
              </tr>
            ))}

          <tr>
            <th></th>
            <th colSpan={3}>Total</th>
            <th>{order.total.toFixed(2)}</th>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="container">
      {order && (
        <div className="row justify-content-center">
          <div className="col-md-10">
            {apiError && <div className="alert alert-danger">{apiError}</div>}
            <div className="card">
              <div className="card-header">
                <div className="d-flex">
                  <h4 className="pt-2">Order Detail</h4>

                  <div className="mt-2 pt-1 ml-4">
                    <OrderStatusLabel status={order.status} />
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex text-secondary">
                  <div>
                    Restaurant Name: <br />
                    Customer Name: <br />
                    Ordered Date: <br />
                  </div>
                  <div className="pl-5">
                    {order.restaurant.name} <br />
                    {order.user.name} <br />
                    {moment(order.createdAt).format("MMMM D, YYYY")}
                    <br />
                  </div>
                </div>

                <div className="my-3">
                  <OrderStatusButton
                    type="owner"
                    onClick={updateStatus}
                    status={order.status}
                  />
                </div>

                <h5 className="py-3 mt-3">Ordered Meals</h5>
                <div className="">{renderOrderItemTable()}</div>
              </div>
              <div className="card-footer">
                <h5 className="py-3">Order History</h5>
                <div>
                  {[...order.track].reverse().map((item) => (
                    <div key={item.status} className="d-flex pt-2 pb-3">
                      <div style={{ width: "200px" }}>
                        <OrderStatusLabel status={item.status} />
                      </div>
                      <div>
                        {moment(item.time).format("HH:mm")},{" "}
                        {moment(item.time).format("MMMM D YYYY")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
