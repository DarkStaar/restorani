import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MealForm from "./MealForm";
import { updateMeal, fetchMeal } from "../../services";


export default function MealEdit({ history }) {
  const [meal, setMeal] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const { mealId } = useParams();
  console.log("here");
  useEffect(() => {
    async function fetchData() {
      try {
        const fetched = await fetchMeal(mealId);
        setMeal(fetched);
      } catch (e) {
        history.goBack();
      }
    }

    fetchData();
  }, [history, mealId]);

  const submitForm = async (formData) => {
    try {
      await updateMeal(mealId, formData);
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
            <div className="card-header font-weight-bold">Update Meal</div>
            <div className="card-body">
              {meal && (
                <MealForm
                  meal={meal}
                  submitButtonText="Update Meal"
                  formError={submitError}
                  handleSubmit={submitForm}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
