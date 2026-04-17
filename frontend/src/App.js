import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ReviewForm from "./components/ReviewForm";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Form Page */}
        {/* <Route path="/" element={<ReviewForm />} /> */}

        {/* Dashboard Page */}
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;