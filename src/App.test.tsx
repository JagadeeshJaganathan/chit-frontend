import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login screen when no user is stored", () => {
  window.localStorage.clear();
  render(<App />);
  expect(
    screen.getByRole("heading", {
      name: "Login",
    }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});
