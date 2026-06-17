function aplicarTemaPorRol(rol) {
  const root = document.documentElement;

  if (rol === "admin") {
    root.style.setProperty("--primary", "#dc3545");
    root.style.setProperty("--dark", "#5c0b14");

  }

  if (rol === "coach") {
    root.style.setProperty("--primary", "#198754");
    root.style.setProperty("--dark", "#0f5132");
  }

  if (rol === "user") {
    root.style.setProperty("--primary", "#0d6efd");
    root.style.setProperty("--dark", "#08306b");
  }
}
