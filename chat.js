// Chat web - Mesa de ayuda Alcaldía de Tebas
// Datos de ejemplo (en el sistema real vienen de la base de funcionarios activos)
const FUNCIONARIO = { nombres: "Juan Esteban", apellidos: "Palacio Gómez", cedula: "1234567890" };
const CODIGO_SMS = "123456";

const chat = document.getElementById("chat");
const campo = document.getElementById("mensaje");
const btnEnviar = document.getElementById("btnEnviar");
const btnReiniciar = document.getElementById("btnReiniciar");
const error = document.getElementById("error");

let paso = "cedula"; // cedula, codigo, confirmar, menu, tipoFalla, descripcion, requerimiento
let tipoAtencion = "";
let tipoFalla = "";

function hora() {
  const f = new Date();
  return f.getHours().toString().padStart(2, "0") + ":" + f.getMinutes().toString().padStart(2, "0");
}

function agregar(texto, quien) {
  const div = document.createElement("div");
  div.className = "mensaje " + quien;
  div.innerHTML = texto + '<span class="hora">' + hora() + "</span>";
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function botDice(texto, despues) {
  const aviso = document.createElement("p");
  aviso.className = "escribiendo";
  aviso.textContent = "escribiendo...";
  chat.appendChild(aviso);
  chat.scrollTop = chat.scrollHeight;
  setTimeout(function () {
    aviso.remove();
    agregar(texto, "bot");
    if (despues) despues();
  }, 700);
}

function mostrarOpciones(lista) {
  const caja = document.createElement("div");
  caja.className = "opciones";
  lista.forEach(function (texto) {
    const b = document.createElement("button");
    b.className = "opcion";
    b.textContent = texto;
    b.addEventListener("click", function () {
      caja.remove();
      procesar(texto);
    });
    caja.appendChild(b);
  });
  chat.appendChild(caja);
  chat.scrollTop = chat.scrollHeight;
}

function mostrarError(texto) {
  error.textContent = texto;
}

function iniciar() {
  chat.innerHTML = "";
  paso = "cedula";
  botDice("Hola, bienvenido a la <b>Mesa de ayuda de la Alcaldía de Tebas</b>.", function () {
    botDice("Para verificar que eres funcionario de la alcaldía, escribe tu número de cédula (solo números).");
  });
}

function procesar(texto) {
  mostrarError("");
  texto = texto.trim();
  if (texto === "") {
    mostrarError("Escribe un mensaje antes de enviar.");
    return;
  }

  // Paso 1: cédula
  if (paso === "cedula") {
    if (!/^\d{6,10}$/.test(texto)) {
      mostrarError("La cédula debe tener solo números (entre 6 y 10 dígitos).");
      return;
    }
    agregar(texto, "usuario");
    if (texto !== FUNCIONARIO.cedula) {
      botDice("No encontré esa cédula en la base de funcionarios activos. Verifica el número e inténtalo de nuevo.");
      return;
    }
    paso = "codigo";
    botDice("Te envié un código de 6 dígitos por SMS a tu celular registrado. Escríbelo aquí. <br><small>(Para la prueba el código es 123456)</small>");
    return;
  }

  // Paso 2: código SMS
  if (paso === "codigo") {
    if (!/^\d{6}$/.test(texto)) {
      mostrarError("El código debe tener exactamente 6 números.");
      return;
    }
    agregar(texto, "usuario");
    if (texto !== CODIGO_SMS) {
      botDice("El código no es correcto. Intenta de nuevo.");
      return;
    }
    paso = "confirmar";
    botDice("Estos son tus datos:<br><b>Nombres:</b> " + FUNCIONARIO.nombres +
      "<br><b>Apellidos:</b> " + FUNCIONARIO.apellidos +
      "<br><b>Cédula:</b> " + FUNCIONARIO.cedula + "<br>¿Son correctos?", function () {
      mostrarOpciones(["Sí, son correctos", "No, no son mis datos"]);
    });
    return;
  }

  // Paso 3: confirmar datos
  if (paso === "confirmar") {
    agregar(texto, "usuario");
    if (texto.indexOf("Sí") === 0) {
      paso = "menu";
      botDice("Bienvenido. ¿Cuentame en que puedo ayudarte en el día de hoy?", function () {
        mostrarOpciones(["Reportar una falla", "Hacer un requerimiento", "Hablar con un Asesor"]);
      });
    } else if (texto.indexOf("No") === 0) {
      botDice("Por seguridad se cierra la atención, ya que los datos no coinciden. Si crees que es un error, comunícate con la oficina de TI de la alcaldía. Gracias por comunicarte con nosotros, hasta luego.");
      paso = "fin";
    } else {
      mostrarOpciones(["Sí, son correctos", "No, no son mis datos"]);
    }
    return;
  }

  // Paso 4: menú principal
  if (paso === "menu") {
    agregar(texto, "usuario");
    if (texto === "Reportar una falla") {
      paso = "tipoFalla";
      botDice("¿Qué tipo de falla tienes?", function () {
        mostrarOpciones(["Bloqueo credenciales de red", "Correo Institucional", "Falla o problema con aplicaciones", "Otros"]);
      });
    } else if (texto === "Hacer un requerimiento") {
      paso = "requerimiento";
      tipoAtencion = "requerimiento";
      botDice("Cuéntame qué necesitas (por ejemplo: instalación de un programa, configuraciones, otros?).");
    } else if (texto === "Hablar con un Asesor") {
      botDice("Puedes comunicarte a la línea <b>018000xxxx</b> para ser atendido por un especialista.");
    } else {
      // el bot no entendió
      botDice("No entendí tu mensaje. Escoge una opción:", function () {
        mostrarOpciones(["Reportar una falla", "Hacer un requerimiento", "Hablar con un Asesor"]);
      });
      botDice("Si necesitas un asesor, llama a la línea <b>018000xxxx</b>.");
    }
    return;
  }

  // Paso 5: tipo de falla
  if (paso === "tipoFalla") {
    agregar(texto, "usuario");
    tipoFalla = texto;
    tipoAtencion = "falla";
    paso = "descripcion";
    botDice("Describe brevemente el problema.");
    return;
  }

  // Paso 6: descripción o requerimiento -> se genera el ticket
  if (paso === "descripcion" || paso === "requerimiento") {
    agregar(texto, "usuario");
    const numero = "TKT-" + Math.floor(1000 + Math.random() * 9000);
    let resumen = "";
    if (tipoAtencion === "falla") {
      resumen = "Tipo de falla: " + tipoFalla + "<br>";
    }
    botDice("Tu caso fue registrado con el número <b>" + numero + "</b>.<br>" + resumen +
      "Un técnico de TI lo atenderá pronto.", function () {
      paso = "fin";
      botDice("¿Necesitas algo más?", function () {
        mostrarOpciones(["Nueva solicitud", "No, gracias"]);
      });
    });
    paso = "espera";
    return;
  }

  // Después de terminar
  if (paso === "fin" || paso === "espera") {
    agregar(texto, "usuario");
    if (texto === "Nueva solicitud") {
      paso = "menu";
      botDice("Claro, ¿qué necesitas?", function () {
        mostrarOpciones(["Reportar una falla", "Hacer un requerimiento", "Hablar con un Asesor"]);
      });
    } else if (texto === "No, gracias") {
      botDice("Gracias por usar la Mesa de ayuda de la Alcaldía de Tebas. ¡Que tengas un buen día!");
    } else {
      botDice("No entendí tu mensaje. Si necesitas un asesor, llama a la línea <b>018000xxxx</b>.");
    }
  }
}

function enviar() {
  const texto = campo.value;
  if (paso === "menu" || paso === "tipoFalla" || paso === "confirmar") {
    // en estos pasos se usan los botones, pero también se acepta texto
  }
  const valido = texto.trim() !== "";
  if (!valido) {
    mostrarError("Escribe un mensaje antes de enviar.");
    return;
  }
  const pasoAntes = paso;
  procesar(texto);
  // solo limpiar si no hubo error de validación
  if (error.textContent === "") campo.value = "";
  campo.focus();
}

btnEnviar.addEventListener("click", enviar);
campo.addEventListener("keydown", function (e) {
  if (e.key === "Enter") enviar();
});
btnReiniciar.addEventListener("click", iniciar);

iniciar();
