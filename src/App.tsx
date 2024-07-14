import React from "react";
import logo from "./logo.svg";
import "./App.css";
import RepositoryDisplay from "./components/repositoryDisplay";

function App() {
  return (
    <div className="App">
      <div>
        <RepositoryDisplay />
      </div>
    </div>
  );
}

export default App;
