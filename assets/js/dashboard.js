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

    // Llenar el área de sidebar y navegación
    document.getElementById("fullname").textContent = usuario.data.full_name;
    document.getElementById("role").textContent = usuario.data.role;
    document.getElementById("perfil_email").textContent = usuario.data.email;
    document.getElementById("perfil_name").textContent = usuario.data.full_name;

    // LLenamos el campo de la seccion de perfil
    document.getElementById("perfil-nombre-card").textContent =
      usuario.data.full_name;
    document.getElementById("perfil-rol").textContent = usuario.data.role;
    document.getElementById("perfil-email-card").textContent =
      usuario.data.email;
    document.getElementById("perfil-fecha-card").textContent =
      usuario.data.birth_date;
    document.getElementById("perfil-rol-card").textContent = usuario.data.role;
    document.getElementById("perfil-registro").textContent = new Date(
      usuario.data.created_at,
    ).toLocaleDateString("es-CL");

    // Formulario editable desde perfil
    document.getElementById("fullname_perfil_input").value =
      usuario.data.full_name;
    document.getElementById("email_perfil_input").value = usuario.data.email;
    document.getElementById("fechaNacimiento_perfil_input").value =
      usuario.data.birth_date;
    document.getElementById("deporteFavorito_perfil_input").value =
      usuario.data.metadata.sports?.[0]?.name || "";

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
      const totalUsuarios = usuariosSistema.length;
      const coaches = usuariosSistema.filter(
        (usuario) => usuario.role === "coach",
      );
      const admins = usuariosSistema.filter(
        (usuario) => usuario.role === "admin",
      );

      document.getElementById("total_usuarios").textContent = totalUsuarios;
      document.getElementById("total_coaches").textContent = coaches.length;
      document.getElementById("total_admin").textContent = admins.length;

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

          return /*html*/ `
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
  const formNuevoUsuario = document.getElementById("formNuevoUsuario");

  // Listener para llenar el modal de editar
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

  // Listener para eliminar
  document.addEventListener("click", async (e) => {
    const btnEliminar = e.target.closest(".btn-eliminar");
    if (!btnEliminar) return;
    const id = Number(btnEliminar.dataset.id);

    const resultado = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!resultado.isConfirmed) return;
    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message);
      }

      await Swal.fire({
        title: "Usuario eliminado",
        text: "El usuario fue eliminado correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // Eliminar de la lista local
      usuariosSistema = usuariosSistema.filter((usuario) => usuario.id !== id);

      // Eliminar la fila de la tabla sin recargar
      btnEliminar.closest("tr").remove();
      actualizarDashboard();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    }
  });

  // Submit: Crear un usuario
  formNuevoUsuario.addEventListener("submit", async (event) => {
    let formularioValido = true;

    event.preventDefault();

    // Nodos del formulario
    const nombre = event.target.elements.full_name;
    const correo = event.target.elements.correo;
    const nacimiento = event.target.elements.nacimiento;
    const password1 = event.target.elements.password1;
    const password2 = event.target.elements.password2;
    const deporte = event.target.elements.deporte;
    const frecuencia = event.target.elements.frecuencia;
    const rol = event.target.elements.role_user;

    // Validaciones de los campos
    // Aquí solo validamos que el nombre tenga al menos 3 caracteres y además que no tenga números
    const nombreInvalido =
      nombre.value.trim().length < 3 || /\d/.test(nombre.value);

    // Utilizamos toggle() para gestionar dinámicamente la clase "is-invalid"
    nombre.classList.toggle("is-invalid", nombreInvalido);

    if (nombreInvalido) {
      formularioValido = false;
    }

    // Aquí podríamos usar una expresión regular para validar el correo, pero fuera de que quitamos la validación de HTML5.
    // podemos apoyarnos del método checkValidity() de la API de validación de formularios del DOM de HTML5
    const correoInvalido = !correo.checkValidity();

    // Utilizamos toggle() para gestionar dinámicamente la clase "is-invalid"
    correo.classList.toggle("is-invalid", correoInvalido);

    if (correoInvalido) {
      formularioValido = false;
    }
    // Y por último validamos que ambas contraseñas tengan una longitud mínima de 8 caracteres
    const password1Valida = password1.value.trim().length >= 8;
    const password2Valida = password2.value.trim().length >= 8;
    // y que coincidan entre sí.
    const passwordsCoinciden = password1.value === password2.value;

    // Utilizamos toggle() para gestionar dinámicamente la clase "is-invalid"
    password1.classList.toggle("is-invalid", !password1Valida);

    password2.classList.toggle(
      "is-invalid",
      !password2Valida || !passwordsCoinciden,
    );

    if (!password1Valida || !password2Valida || !passwordsCoinciden) {
      formularioValido = false;
    }

    if (!formularioValido) {
      return;
    }

    const opcionfetch = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: nombre.value,
        email: correo.value,
        password: password1.value,
        role: rol.value || "user",
        birth_date: nacimiento.value,
        metadata: {
          sports: [
            {
              name: deporte.value,
              frecuency_per_week: frecuencia.value || 0,
            },
          ],
        },
      }),
    };
    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/auth/register`,
        opcionfetch,
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        console.log(data);
        throw new Error(data.message);
      }

      // Una vez creado el usuario, reseteamos el formulario
      event.target.reset();

      await Swal.fire({
        icon: "success",
        title: "Usuario creado",
        text: "El usuario fue registrado correctamente.",
        confirmButtonText: "Aceptar",
      });

      // recargamos la página
      window.location.reload();
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error al crear usuario",
        text: error.message,
        confirmButtonText: "Aceptar",
      });
    }
  });

  // Actualizar Dashboard
  function actualizarDashboard() {
    const totalUsuarios = usuariosSistema.length;

    const coaches = usuariosSistema.filter(
      (usuario) => usuario.role === "coach",
    );

    const admins = usuariosSistema.filter(
      (usuario) => usuario.role === "admin",
    );

    document.getElementById("total_usuarios").textContent = totalUsuarios;
    document.getElementById("total_coaches").textContent = coaches.length;
    document.getElementById("total_admin").textContent = admins.length;

    const ultimosUsuarios = [...usuariosSistema]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    document.getElementById("ultimosUsuariosBody").innerHTML = ultimosUsuarios
      .map(
        (usuario) => `
      <tr>
        <td>${usuario.full_name}</td>
        <td>${usuario.role}</td>
        <td>${new Date(usuario.created_at).toLocaleDateString("es-CL")}</td>
      </tr>
    `,
      )
      .join("");
  }

  actualizarDashboard();
});
