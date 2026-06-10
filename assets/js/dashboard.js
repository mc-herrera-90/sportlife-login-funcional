window.addEventListener("load", async () => {
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
  } catch (error) {
    console.error(error);

    localStorage.removeItem("token");
    window.location.href = "/login.html";
  }
});
