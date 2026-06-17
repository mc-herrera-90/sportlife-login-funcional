async function crearUsuario(payload, requiereAuth = true) {
  const respuesta = await fetch(
    requiereAuth
      ? ENDPOINTS.users.create
      : ENDPOINTS.auth.register,
    {
      method: "POST",
      headers: requiereAuth
        ? getAuthHeaders()
        : {
            "Content-Type": "application/json",
          },
      body: JSON.stringify(payload),
    }
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message);
  }

  return datos;
}

async function actualizarUsuario(id, payload) {
  const respuesta = await fetch(ENDPOINTS.users.byId(id), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message);
  }

  return datos;
}

async function obtenerUsuarios() {
  const respuesta = await fetch(ENDPOINTS.users.list, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || "Error al obtener usuarios");
  }
  return datos;
}

async function eliminarUsuario(id) {
  const respuesta = await fetch(ENDPOINTS.users.byId(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || "Error al eliminar usuario");
  }

  return datos;
}

async function obtenerUltimosUsuarios(cantidad = 5) {
  const datos = await obtenerUsuarios();

  return {
    ...datos,
    data: datos.data
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, cantidad),
  };
}
