import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Admin from "@/pages/Admin";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;