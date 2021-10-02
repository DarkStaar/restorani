import React, { useState } from "react";
import UserForm from "./UserForm";
import { createUser } from "../../services";

export default function UserAdd({ history }) {
  const [submitError, setSubmitError] = useState(null);

  const submitForm = async (formData) => {
    try {
      await createUser(formData);
      history.push("/manage/users");
    } catch (e) {
      setSubmitError(e.message);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header font-weight-bold">Create User</div>
            <div className="card-body">
              <UserForm
                submitButtonText="Create User"
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
