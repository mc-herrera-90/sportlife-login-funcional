function validarEmail(input) {
  const esValido = input.checkValidity();

  input.classList.toggle("is-invalid", !esValido);

  return esValido;
}

function validarPassword(input) {
  const esValido = input.value.trim().length >= 8;

  input.classList.toggle("is-invalid", !esValido);

  return esValido;
}

function validarNombre(input) {
  const esValido = input.value.trim().length >= 3 && !/\d/.test(input.value);

  input.classList.toggle("is-invalid", !esValido);

  return esValido;
}

function validarPasswordsCoinciden(password1, password2) {
  const esValido = password1.value === password2.value;

  password2.classList.toggle("is-invalid", !esValido);

  return esValido;
}

function validarFormularioRegistro({ nombre, correo, password1, password2 }) {
  const nombreValido = validarNombre(nombre);
  const correoValido = validarEmail(correo);
  const password1Valida = validarPassword(password1);
  const password2Valida = validarPassword(password2);
  const passwordsCoinciden = validarPasswordsCoinciden(password1, password2);

  return (
    nombreValido &&
    correoValido &&
    password1Valida &&
    password2Valida &&
    passwordsCoinciden
  );
}
