window.addEventListener("load", async () => {
  
  let usuariosSistema = [];
  
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    const respuesta = await fetch("http://localhost:3000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo obtener la información del usuario");
    }

    const usuario = await respuesta.json();

    document.getElementById("fullname").textContent = usuario.data.full_name;
    document.getElementById("role").textContent = usuario.data.role;

    document.getElementById("perfil_email").textContent = usuario.data.email;
    document.getElementById("perfil_name").textContent = usuario.data.full_name;


    if (usuario.data.role === "admin") {
      // Sólo cuando el login sea de un admin, realizamos la petición para obtener a los usuarios para gestionarlos
      const respuestaUsuarios = await fetch("http://localhost:3000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuestaUsuarios.ok) {
        throw new Error("No se pudieron obtener los usuarios");
      }

      const usuarios = await respuestaUsuarios.json();

      usuariosSistema = usuarios.data;

      const tbody = document.getElementById("usuariosTableBody");

      tbody.innerHTML = usuariosSistema
        .map((usuario) => {
          const fechaRegistro = new Date(usuario.created_at).toLocaleString(
            "es-CL",
          );

          let badgeRol = "";

          switch (usuario.role) {
            case "admin":
              badgeRol = `<span class="badge text-bg-danger">Administrador</span>`;
              break;

            case "coach":
              badgeRol = `<span class="badge text-bg-primary">Coach</span>`;
              break;

            default:
              badgeRol = `<span class="badge text-bg-success">Usuario</span>`;
          }

          return `
    <tr>
      <td>${usuario.id}</td>
      <td>
        <strong>${usuario.full_name}</strong>
      </td>
      <td>
        ${usuario.email}
      </td>
      <td>
        ${badgeRol}
      </td>
      <td>
        ${fechaRegistro}
      </td>
      <td>
        <button
          class="btn btn-sm btn-outline-primary me-2 btn-editar"
          data-id="${usuario.id}"
          data-usuario='${JSON.stringify(usuario)}'
          title="Editar">
          <i class="fa-solid fa-pen-to-square"></i>

        </button>

        <button
          class="btn btn-sm btn-outline-danger btn-eliminar"
          data-id="${usuario.id}"
          title="Eliminar">

          <i class="fa-solid fa-trash"></i>

        </button>

      </td>

    </tr>
  `;
        })
        .join("");
    }
  } catch (error) {
    console.error(error.message);
    localStorage.removeItem("token");
    window.location.href = "../";
  }

  // Listeners
  const formNuevoUsuario = "";

  // Listener para el modal de editar
  document.addEventListener("click", (e) => {
    const btnEditar = e.target.closest(".btn-editar");

    if (!btnEditar) return;

    const id = Number(btnEditar.dataset.id);

    const usuario = usuariosSistema.find((usuario) => usuario.id === id);

    if (!usuario) return;

    // Llenar formulario
    document.getElementById("edit_id").value = usuario.id;
    document.getElementById("edit_full_name").value = usuario.full_name;
    document.getElementById("edit_email").value = usuario.email;
    document.getElementById("edit_birth_date").value = usuario.birth_date;
    document.getElementById("edit_role").value = usuario.role;
    document.getElementById("edit_must_change_password").checked =
      usuario.must_change_password;
    if (usuario.metadata?.sports?.length > 0) {
      document.getElementById("edit_sport").value =
        usuario.metadata.sports[0].name;

      document.getElementById("edit_frequency_per_week").value =
        usuario.metadata.sports[0].frequency_per_week;
    }

    // Mostrar modal
    const modalEditar = new bootstrap.Modal(
      document.getElementById("editarUsuarioModal"),
    );

    modalEditar.show();
  });
});
