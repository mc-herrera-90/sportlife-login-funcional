const formLogin = document.getElementById("login");
const feedback = document.getElementById("feedback");

window.addEventListener("load", () => {
  // Listener
  formLogin.addEventListener("submit", async (event) => {
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

    // Buscar al usuario
    // const usuarioEncontrado = usuarios.find((usuario) => {
    //     return usuario.user === correo.toLowerCase() && usuario.password === password.toLowerCase()
    // })

    // if (!usuarioEncontrado) {
    //     feedback.classList.remove("d-none")
    //     return;
    // }

    // Guardamos al usuario encontrado en el localStorage
    // localStorage.setItem("sesionUsuario", JSON.stringify(usuarioEncontrado));

    // Redirigir al dashboard según el rol
    // switch(usuarioEncontrado.role) {
    //     case "user":
    //         window.location.href = "../dashboards/user.html";
    //         break;

    //     case "coach":
    //         window.location.href = "../dashboards/coach.html";
    //         break;

    //     case "admin":
    //         window.location.href = "../dashboards/admin.html";
    //         break;

    //     default:
    //         feedback.classList.remove("d-none");
    //         feedback.textContent = "Rol no encontrado";
    // }
  });
});
