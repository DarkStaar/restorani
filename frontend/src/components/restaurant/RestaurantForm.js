import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";

function RestaurantForm({
  restaurant,
  formError,
  submitButtonText = "Create Restaurant",
  handleSubmit,
  history,
}) {
  const [name, setName] = useState(restaurant ? restaurant.name : "");
  const [nameError, setNameError] = useState(null);
  const [description, setDescription] = useState(
    restaurant ? restaurant.description : ""
  );
  const [descriptionError, setDescriptionError] = useState(null);
  const [foodType, setFoodType] = useState(
    restaurant ? restaurant.foodType : ""
  );
  const [foodTypeError, setFoodTypeError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    let hasError = false;
    if (name.length === 0) {
      setNameError("Name is required");
      hasError = true;
    } else {
      setNameError(null);
    }

    if (description.length === 0) {
      setDescriptionError("Description is required");
      hasError = true;
    } else {
      setDescriptionError(null);
    }

    if (foodType.length === 0) {
      setFoodTypeError("Type of Food is required");
      hasError = true;
    } else {
      setFoodTypeError(null);
    }

    return !hasError;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validateForm()) {
      return;
    }
    const formData = {
      name,
      description,
      foodType,
    };

    handleSubmit(formData);
  };

  useEffect(() => {
    if (submitted) {
      validateForm();
    }
  }, [name, description, foodType, submitted])

  const cancel = (e) => {
    e.preventDefault();
    history.push("/restaurants");
  };

  return (
    <form onSubmit={submitForm}>
      <div className="form-group row">
        <label className="col-md-4 col-form-label text-md-right">Name</label>

        <div className="col-md-6">
          <input
            id="name"
            type="text"
            className={"form-control" + (nameError ? " is-invalid" : "")}
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {nameError && (
            <span className="invalid-feedback" role="alert">
              <strong>{nameError}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="form-group row">
        <label className="col-md-4 col-form-label text-md-right">
          Description
        </label>

        <div className="col-md-6">
          <input
            id="description"
            type="text"
            className={"form-control" + (descriptionError ? " is-invalid" : "")}
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {descriptionError && (
            <span className="invalid-feedback" role="alert">
              <strong>{descriptionError}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="form-group row">
        <label className="col-md-4 col-form-label text-md-right">
          Type of Food
        </label>

        <div className="col-md-6">
          <input
            id="foodType"
            type="text"
            className={"form-control" + (foodTypeError ? " is-invalid" : "")}
            name="foodType"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
          />

          {foodTypeError && (
            <span className="invalid-feedback" role="alert">
              <strong>{foodTypeError}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="form-group row mb-0">
        <div className="col-md-6 offset-md-4">
          {formError && (
            <div className="pb-3 text-danger">
              <strong>{formError}</strong>
            </div>
          )}
          <button type="submit" className="btn btn-success">
            {submitButtonText}
          </button>
          <button className="ml-2 btn btn-secondary" onClick={cancel}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default withRouter(RestaurantForm);
