import React from "react"
import { OrderStatusNames, OrderStatus } from "../../constants/constants"

const statusClasses = {
  [OrderStatus.Placed]: "text-secondary",
  [OrderStatus.Processing]: "text-warning",
  [OrderStatus.InRoute]: "text-info",
  [OrderStatus.Delivered]: "text-primary",
  [OrderStatus.Received]: "text-success",
  [OrderStatus.Canceled]: "text-danger",
}


export default function OrderStatusLabel({ status }) {
  return (
    <span className={statusClasses[status]}>
      <b>{OrderStatusNames[status]}</b>
    </span>
  );
}
