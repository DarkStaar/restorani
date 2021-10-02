import React, { useState, useEffect, useRef, useContext } from "react";
import { withRouter, Link } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";
import NavDropdown from "react-bootstrap/NavDropdown";
import { LinkContainer } from "react-router-bootstrap";
import AppContext from "./AppContext";

function Header({ history }) {
  const appContext = useContext(AppContext);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    let role = null;
    if (auth) {
      role = auth.user.role;
      setRole(role);
      setName(auth.user.name);
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  }, [history.location, appContext.auth]);

  return (
    <Navbar bg="light" expand="md">
      <LinkContainer to="/">
        <Navbar.Brand>Food Delivery Service</Navbar.Brand>
      </LinkContainer>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        {isAuthenticated && (
          <Nav className="mr-auto">
            {role === "user" && (
              <LinkContainer to="/restaurants">
                <Nav.Link>Restaurants</Nav.Link>
              </LinkContainer>
            )}
            {role === "user" && (
              <LinkContainer to="/orders">
                <Nav.Link>My Orders</Nav.Link>
              </LinkContainer>
            )}

            {role === "owner" && (
              <LinkContainer to="/manage/restaurants">
                <Nav.Link>Manage Restaurants</Nav.Link>
              </LinkContainer>
            )}

            {role === "owner" && (
              <LinkContainer to="/manage/orders">
                <Nav.Link>Manage Orders</Nav.Link>
              </LinkContainer>
            )}
            {role === "admin" && (
              <LinkContainer to="/manage/users">
                <Nav.Link>Manage Users</Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        )}

        <Nav className="ml-auto">
          {!isAuthenticated && (
            <>
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
              <Nav.Link as={Link} to="/register">
                Register
              </Nav.Link>
            </>
          )}
          {isAuthenticated && (
            <NavDropdown title={name} id="collasible-nav-dropdown">
              <NavDropdown.Item as={Link} to="/account">
                My Account
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/logout">
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default withRouter(Header);
