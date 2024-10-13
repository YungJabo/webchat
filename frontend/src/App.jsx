import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./global.scss";
import { Home } from "./pages/Home";
import { LoginPage } from "./pages/LoginPage";
import { useEffect, useState } from "react";
import { Profile } from "./pages/Profile";

function App() {
  return (
    <>
      <div className="wrapper">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
