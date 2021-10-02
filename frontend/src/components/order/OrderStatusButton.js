import React from "react";
import { OrderStatusNames, OrderStatus } from "../../constants/constants";


const statusClasses = {
  [OrderStatus.Placed]: "btn-secondary",
  [OrderStatus.Processing]: "btn-warning",
  [OrderStatus.InRoute]: "btn-info",
  [OrderStatus.Delivered]: "btn-primary",
  [OrderStatus.Received]: "btn-success",
  [OrderStatus.Canceled]: "btn-danger",
};

const statusTransition = {
  user: {
    [OrderStatus.Placed]: OrderStatus.Canceled,
    [OrderStatus.Delivered]: OrderStatus.Received,
  },
  owner: {
    [OrderStatus.Placed]: OrderStatus.Processing,
    [OrderStatus.Processing]: OrderStatus.InRoute,
    [OrderStatus.InRoute]: OrderStatus.Delivered,
  }
}

export default function OrderStatusButton({
  status,
  type = "user",
  buttonText,
  onClick,
  ...rest
}) {
  let nextStatus = statusTransition[type][status];
  let title = "";

  if (!nextStatus) {
    return <React.Fragment />;
  }

  title = OrderStatusNames[nextStatus];

  if (nextStatus === OrderStatus.Received) {
    title = "Mark as received";
  } else if (nextStatus === OrderStatus.Canceled) {
    title = "Cancel";
  }

  return (
    <button className={"btn btn-sm " + statusClasses[nextStatus]} onClick={(e) => { e.stopPropagation(); onClick(nextStatus); }} {...rest}>
      {title}
    </button>
  );
}
