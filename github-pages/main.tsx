import { createRoot } from "react-dom/client";
import Page from "../app/page";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Unable to find the game root element");
}

createRoot(root).render(<Page />);
