const formNuevoUsuario = document.getElementById("formNuevoUsuario");
const formEditarUsuario = document.getElementById("formEditarUsuario");
const formEditarPerfilUsuario = document.getElementById("formPerfil");
const menuLinks = document.querySelectorAll("[data-section]");
const sections = document.querySelectorAll("section");
const nuevoUsuarioModal = document.getElementById("nuevoUsuarioModal");
const editarUsuarioModal = document.getElementById("editarUsuarioModal");

window.addEventListener("load", () => {
  renderDashboard();
  initSections();
  // LISTENER: SUBMIT
  // Crear usuario (admin)
  formNuevoUsuario?.addEventListener("submit", handleCrearUsuario);
  // Actualiza usuario (admin)
  formEditarUsuario?.addEventListener("submit", handleActualizarUsuario);
  // Editar perfil de usuario
  formEditarPerfilUsuario?.addEventListener(
    "submit",
    handleEditarPerfilUsuario,
  );

  // LISTENER: CLICK
  // Cerrar sesion
  document.getElementById("btnLogout").addEventListener("click", handleLogout);
  // Mostrar formulario de editar usuario
  document.addEventListener("click", handleMostrarFormularioEditarUsuario);
  // Eliminar usuario
  document.addEventListener("click", handleEliminarUsuario);
});

// Render Dashboard
async function renderDashboard() {
  const usuario = JSON.parse(localStorage.getItem("user"));
  aplicarTemaPorRol(usuario.role);

  let color;
  let rol;
  switch (usuario.role) {
    case "admin":
      color = "dc3545";
      rol = "administrador";
      document
        .querySelector('[data-section="reportes"]')
        .classList.remove("d-none");
      break;
    case "coach":
      color = "198754";
      rol = "coach";
      break;
    default:
      color = "0d6efd";
      rol = "usuario";
      document.getElementById("motivacion").classList.remove("d-none");
  }

  // Título
  document.title = `Dashboard | ${capitalize(rol)}`;

  document.querySelectorAll('[data-user="full_name"]').forEach((el) => {
    el.textContent = usuario.full_name;
  });
  document.querySelectorAll('[data-user="email"]').forEach((el) => {
    el.textContent = usuario.email;
  });

  document.querySelectorAll('[data-user="role"]').forEach((el) => {
    el.textContent = rol;
  });

  document.getElementById("member_since").textContent = new Date(
    usuario.created_at,
  ).getFullYear();

  document.getElementById("avatar").src =
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      usuario.full_name,
    )}&background=${color}&color=fff`;

  // SECCIÓN PERFIL
  document.getElementById("perfil-avatar").src =
    `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.full_name)}`;
  document.getElementById("perfil-nombre-card").textContent = usuario.full_name;
  document.getElementById("perfil-rol").textContent = rol;
  document.getElementById("perfil-email-card").textContent = usuario.email;
  document.getElementById("perfil-fecha-card").textContent = usuario.birth_date;
  document.getElementById("perfil-rol-card").textContent = capitalize(rol);
  document.getElementById("perfil-registro").textContent = new Date(
    usuario.created_at,
  ).toLocaleDateString("es-CL");

  // SECCIÓN PERFIL FORMULARIO EDITABLE
  document.getElementById("input_perfil_full_name").value = usuario.full_name;
  document.getElementById("input_perfil_email").value = usuario.email;
  document.getElementById("input_perfil_nacimiento").value = usuario.birth_date;
  document.getElementById("deporte_perfil_input").value =
    usuario.metadata?.sports?.[0]?.name || "";

  //  SOLO ADMIN
  const esAdmin = usuario.role === "admin";

  const menuUsuarios = document.querySelector('[data-section="usuarios"]');
  const ultimosUsuariosSection = document.getElementById(
    "ultimosUsuariosSection",
  );
  if (menuUsuarios) {
    menuUsuarios.style.display = esAdmin ? "flex" : "none";
    ultimosUsuariosSection.style.display = esAdmin ? "block" : "none";

    let usuariosSistema = [];

    try {
      datos = await obtenerUsuarios();
      usuariosSistema = datos.data;
      renderAdminDashboard(usuariosSistema);
    } catch (error) {
      console.log(error);
    }
  }
}

// Render Admin seccion usuarios
function renderAdminDashboard(usuariosSistema) {
  const coaches = usuariosSistema.filter((usuario) => usuario.role === "coach");
  const admins = usuariosSistema.filter((usuario) => usuario.role === "admin");

  document.getElementById("total_usuarios").textContent =
    usuariosSistema.length;
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

function initSections() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-section]");
    if (!link) return;
    e.preventDefault();
    const section = link.dataset.section;
    sections.forEach((sec) => sec.classList.add("d-none"));
    document.getElementById(`${section}-section`).classList.remove("d-none");
    menuLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
    if (window.innerWidth <= 992) {
      sidebar.classList.remove("show");
    }
  });
}

async function confirmarEliminacion() {
  const result = await Swal.fire({
    title: "¿Eliminar usuario?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });

  if (!result.isConfirmed) {
    throw new Error("Cancelado");
  }
}

// HANDLER
async function handleCrearUsuario(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const nombre = document.getElementById("input_full_name");
  const correo = document.getElementById("input_email");
  const password1 = document.getElementById("input_password1");
  const password2 = document.getElementById("input_password2");

  const esValido = validarFormularioRegistro({
    nombre,
    correo,
    password1,
    password2,
  });

  const payload = {
    full_name: formData.get("input_full_name"),
    email: formData.get("input_email"),
    birth_date: formData.get("input_nacimiento"),
    password: formData.get("input_password1"),
    role: formData.get("role_user") || "user",
  };

  if (!esValido) return;

  const datos = await crearUsuario(payload);

  if (datos.ok) {
    await Swal.fire({
      position: "top-end",
      icon: "success",
      title: datos.message,
      showConfirmButton: false,
      timer: 1500,
    });
    renderDashboard();
    bootstrap.Modal.getInstance(nuevoUsuarioModal).hide();
  }
}

async function handleEditarPerfilUsuario(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const payload = {
    full_name: formData.get("input_perfil_full_name"),
    email: formData.get("input_perfil_email"),
    birth_date: formData.get("input_perfil_nacimiento"),
    metadata: {
      sports: [
        {
          name: formData.get("deporte_perfil_input"),
          frequency_per_week:
            Number(formData.get("frecuencia_perfil_input")) || 0,
        },
      ],
    },
  };

  try {
    const datos = await actualizarMiPerfil(payload);
    deshabilitarEdicion();

    if (datos.ok) {
      await Swal.fire({
        position: "top-end",
        icon: "success",
        title: datos.message,
        showConfirmButton: false,
        timer: 1500,
      });
    }
    renderDashboard();
  } catch (error) {
    console.log(error);
  }
}

async function handleMostrarFormularioEditarUsuario(e) {
  const btnEditar = e.target.closest(".btn-editar");
  if (!btnEditar) return;

  const usuario = JSON.parse(btnEditar.dataset.usuario);
  if (!usuario) return;

  document.getElementById("edit_id").value = usuario.id;
  document.getElementById("edit_full_name").value = usuario.full_name;
  document.getElementById("edit_email").value = usuario.email;
  document.getElementById("edit_nacimiento").value = usuario.birth_date;
  document.getElementById("edit_rol").value = usuario.role;

  const sport = usuario.metadata?.sports?.[0];

  if (sport) {
    document.getElementById("edit_deporte").value = sport.name;
    document.getElementById("edit_frecuencia").value = sport.frequency_per_week;
  }

  const modalEditar = new bootstrap.Modal(
    document.getElementById("editarUsuarioModal"),
  );

  modalEditar.show();
}

async function handleLogout() {
  const result = await Swal.fire({
    title: "¿Cerrar sesión?",
    text: "Tu sesión actual se cerrará",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, salir",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    logout();
  }
}

async function handleActualizarUsuario(event) {
  event.preventDefault();
  let formularioValido = true;

  const id = document.getElementById("edit_id").value;

  const formData = new FormData(event.target);
  const nombre = document.getElementById("edit_full_name");
  const correo = document.getElementById("edit_email");

  if (!validarNombre(nombre)) formularioValido = false;
  if (!validarEmail(correo)) formularioValido = false;

  if (!formularioValido) return;

  const payload = {
    full_name: formData.get("edit_full_name"),
    email: formData.get("edit_email"),
    role: formData.get("edit_rol"),
    birth_date: formData.get("edit_nacimiento"),
  };

  try {
    const datos = await actualizarUsuario(id, payload);
    if (datos.ok) {
      await Swal.fire({
        position: "top-end",
        icon: "success",
        title: datos.message,
        showConfirmButton: false,
        timer: 1500,
      });
      bootstrap.Modal.getInstance(editarUsuarioModal).hide();
      renderDashboard();
    }
  } catch (error) {
    console.log(error);
  }
}

async function handleEliminarUsuario(e) {
  const btn = e.target.closest(".btn-eliminar");
  if (!btn) return;

  const id = Number(btn.dataset.id);

  try {
    await confirmarEliminacion();
    const resultado = await eliminarUsuario(id);

    await Swal.fire({
      icon: "success",
      title: resultado.message,
      timer: 1500,
      showConfirmButton: false,
    });

    await renderDashboard();
  } catch (error) {
    if (error) {
      Swal.fire({
        icon: "error",
        title: error.message,
      });
    }
  }
}
