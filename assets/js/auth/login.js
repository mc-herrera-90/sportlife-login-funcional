const formLogin = document.getElementById("login");
const feedback = document.getElementById("feedback");

window.addEventListener("load", () => {
  formLogin?.addEventListener("submit", iniciarSesion);
});

async function iniciarSesion(event) {
  event.preventDefault();

  feedback.classList.add("d-none");
  feedback.textContent = "";

  const { correo, password } = event.target.elements;

  const formularioValido =
    validarEmail(correo) &&
    validarPassword(password);

  if (!formularioValido) {
    return;
  }

  try {
    await login(
      correo.value.trim(),
      password.value.trim()
    );

  } catch (error) {
    console.error(error);

    feedback.textContent = error.message;
    feedback.classList.remove("d-none");
  }
}
