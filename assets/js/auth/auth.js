function guardarToken(token) {
  localStorage.setItem("token", token);
}

function obtenerToken() {
  return localStorage.getItem("token");
}

function eliminarToken() {
  localStorage.removeItem("token");
}

function guardarDatos(datos) {
  localStorage.setItem("user", datos);
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${obtenerToken()}`,
  };
}

async function login(email, password) {
  const respuesta = await fetch(ENDPOINTS.auth.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message);
  }

  guardarToken(datos.data.token);
  guardarDatos(JSON.stringify(datos.data.user));
  redireccionar('../pages/dashboard.html');
}

function logout() {
  localStorage.clear();
  window.location.href = "../";
}

function redireccionarPorRol(role) {
  const dashboards = {
    admin: "../dashboards/admin.html",
    coach: "../dashboards/coach.html",
    user: "../dashboards/user.html",
  };

  const destino = dashboards[role];

  if (!destino) {
    throw new Error("Rol no encontrado");
  }

  window.location.href = destino;
}

function redireccionar(destino) {
  window.location.href = destino;
}

async function actualizarMiPerfil(payload) {
  const respuesta = await fetch(ENDPOINTS.auth.updateMe, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const datos = await respuesta.json();
  guardarDatos(JSON.stringify(datos.data));

  if (!respuesta.ok) {
    throw new Error(datos.message);
  }

  return datos;
}
