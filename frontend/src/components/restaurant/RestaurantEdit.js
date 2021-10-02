import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RestaurantForm from "./RestaurantForm";
import { updateRestaurant, fetchRestaurant } from "../../services";

export default function RestaurantEdit({ history }) {
  const [restaurant, setRestaurant] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const { restaurantId } = useParams();
  console.log("here");
  useEffect(() => {
    async function fetchData() {
      try {
        const fetched = await fetchRestaurant(restaurantId);
        setRestaurant(fetched);
      } catch (e) {
        history.push("/manage/restaurants");
      }
    }

    fetchData();
  }, [history, restaurantId]);

  const submitForm = async (formData) => {
    try {
      await updateRestaurant(restaurantId, formData);
      history.push("/manage/restaurants");
    } catch (e) {
      setSubmitError(e.message);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header font-weight-bold">
              Update Restaurant
            </div>
            <div className="card-body">
              {restaurant && (
                <RestaurantForm
                  restaurant={restaurant}
                  submitButtonText="Update Restaurant"
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
