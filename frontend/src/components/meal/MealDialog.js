import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";

export default function MealDialog({ open, onClose, onAdd, meal }) {
  const [count, setCount] = useState(1);

  if (!meal) {
    return <React.Fragment />;
  }

  const onIncreaseCount = () => {
    setCount(count + 1);
  };

  const onDecreaseCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };
  return (
    <Modal show={open} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{meal.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-secondary">{meal.description}</p>
        <p></p>
        <div>
          <b>$ {meal.price.toFixed(2)}</b>
          <div className="float-right">
            <a className="btn text-secondary" onClick={onDecreaseCount}>
              <i className="fas fa-minus-square"></i>
            </a>
            <span>{count}</span>
            <a className="btn text-secondary" onClick={onIncreaseCount}>
              <i className="fas fa-plus-square"></i>
            </a>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div
          className="btn btn-default"
          onClick={() => {
            onClose();
            setCount(1);
          }}
        >
          Cancel
        </div>
        <div
          className="btn btn-success"
          onClick={() => {
            onAdd(meal.id, count);
            setCount(1);
          }}
        >
          Add to cart
        </div>
      </Modal.Footer>
    </Modal>
  );
}
