const formRegistro = document.getElementById("registro");

window.addEventListener("load", () => {
  formRegistro?.addEventListener("submit", registrarUsuario);
});

async function registrarUsuario(event) {
  event.preventDefault();

  const {
    nombre,
    correo,
    nacimiento,
    password1,
    password2,
    deporte,
    frecuencia,
  } = event.target.elements;

  const formularioValido = validarFormularioRegistro({
    nombre,
    correo,
    password1,
    password2,
  });

  if (!formularioValido) return;

  const email = correo.value.trim();
  const password = password1.value;

  try {
    await crearUsuario(
      {
        full_name: nombre.value.trim(),
        email,
        password,
        birth_date: nacimiento.value || null,
        metadata: {
          sports: [
            {
              name: deporte.value,
              frequency_per_week: Number(frecuencia.value) || 0,
            },
          ],
        },
      },
      false
    );

    event.target.reset();

    const resultado = await Swal.fire({
      icon: "success",
      title: "Registro exitoso",
      text: "¿Deseas iniciar sesión ahora?",
      showCancelButton: true,
      confirmButtonText: "Sí, iniciar sesión",
      cancelButtonText: "No",
      reverseButtons: true,
    });

    if (resultado.isConfirmed) {
      await login(email, password);
    }

  } catch (error) {
    console.error(error);

    await Swal.fire({
      icon: "error",
      title: "Error al registrarse",
      text: error.message,
      confirmButtonText: "Aceptar",
    });
  }
}
