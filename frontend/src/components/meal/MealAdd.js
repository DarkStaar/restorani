import React, { useState } from "react";
import { useParams } from "react-router-dom";
import MealForm from "./MealForm";
import { createMeal } from "../../services";


export default function MealAdd({ history }) {
  const { restaurantId } = useParams();
  const [submitError, setSubmitError] = useState(null);

  const submitForm = async (formData) => {
    try {
      await createMeal({ ...formData, restaurantId });
      history.goBack();
    } catch (e) {
      setSubmitError(e.message);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header font-weight-bold">Create Meal</div>
            <div className="card-body">
              <MealForm
                submitButtonText="Create Meal"
                formError={submitError}
                handleSubmit={submitForm}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
