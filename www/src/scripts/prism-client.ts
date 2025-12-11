import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";

function highlight() {
  Prism.highlightAll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", highlight, { once: true });
} else {
  highlight();
}
