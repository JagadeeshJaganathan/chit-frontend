// public/service-worker.js
/* eslint-disable no-restricted-globals */

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
});

self.addEventListener("fetch", (event) => {
  // basic pass-through
});
