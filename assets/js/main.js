const formLogin = document.getElementById("login");
const feedback = document.getElementById("feedback"); 

const BASE_PATH = location.pathname.split("/")[1]
  ? `/${location.pathname.split("/")[1]}`
  : "";

window.addEventListener("load", async () => {

    // Cargamos la data del JSON
    const respuesta = await fetch(`${BASE_PATH}/data/users.json`);

    const usuarios = respuesta.ok ? await respuesta.json() : [];

    console.log(usuarios);

    // Listener
    formLogin.addEventListener("submit", (event) => {
        event.preventDefault();

        const correo = event.target.elements.correo.value;
        const password = event.target.elements.contrasenia.value;

        // Buscar al usuario
        const usuarioEncontrado = usuarios.find((usuario) => {
            return usuario.user === correo.toLowerCase() && usuario.password === password.toLowerCase()
        })

        if (!usuarioEncontrado) {
            feedback.classList.remove("d-none")
            return;
        }

        // Guardamos al usuario encontrado en el localStorage
        localStorage.setItem("sesionUsuario", JSON.stringify(usuarioEncontrado));

        // Redirigir al dashboard según el rol
        switch(usuarioEncontrado.role) {
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

    })

})
