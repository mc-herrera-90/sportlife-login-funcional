window.addEventListener("load", () => {
    const usuario = JSON.parse(localStorage.getItem("sesionUsuario"));

    document.getElementById("fullname").textContent = usuario.fullname;
    document.getElementById("role").textContent = usuario.role;
    document.getElementById("perfil_email").textContent = usuario.user;
})
