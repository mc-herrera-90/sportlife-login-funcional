const formLogin = document.getElementById("login");
const formRegister = document.getElementById("register");

const feedback = document.getElementById("feedback");

window.addEventListener("load", () => {
  // Listener login
  formLogin?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const correo = event.target.elements.correo.value;
    const password = event.target.elements.contrasenia.value;

    const opcionesFetch = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: correo,
        password: password,
      }),
    };

    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/auth/login`,
        opcionesFetch,
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.message || "Credenciales inválidas");
      }

      console.log(datos.data.token);
      localStorage.setItem("token", datos.data.token);

      // Redirigir al dashboard según el rol
      switch (datos.data.user.role) {
        case "user":
          window.location.href = "../dashboards/user.html";
          break;

        case "coach":
          window.location.href = "../dashboards/coach.html";
          break;

        case "admin":
          window.location.href = "../dashboards/admin.html";
          break;

        default:
          feedback.classList.remove("d-none");
          feedback.textContent = "Rol no encontrado";
      }
    } catch (error) {
      console.error(error);
      feedback.textContent = error.message;
      feedback.classList.remove("d-none");
    }
  });

  // Listener registro
  formRegister?.addEventListener("submit", async (event) => {
    event.preventDefault();

    let formularioValido = true;
    // Nodos del formulario
    const nombre = event.target.elements.nombre;
    const correo = event.target.elements.correo;
    const nacimiento = event.target.elements.nacimiento;
    const password1 = event.target.elements.password1;
    const password2 = event.target.elements.password2;
    const deporte = event.target.elements.deporte;
    const frecuencia = event.target.elements.frecuencia;

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
        return;
      }
      // Una vez creado el usuario, reseteamos el formulario
      event.target.reset();

      // Y activamos la notificación del Toast de Bootstrap
      const toast = new bootstrap.Toast(
        document.getElementById("toastRegistro"),
      );
      toast.show();
    } catch (error) {
      console.error(error);
    }
  });
});
