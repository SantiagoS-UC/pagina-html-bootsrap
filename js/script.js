// Sección 2: al escoger una especialidad se muestra su descripción
// y solo quedan visibles los médicos que la atienden.
const descripciones = {
  todas: 'Selecciona una especialidad para ver su descripción y los médicos que la atienden.',
  'terapia-neural': 'La Terapia Neural regula el sistema nervioso mediante la aplicación de anestésicos locales en puntos específicos del cuerpo, ayudando a aliviar el dolor crónico.',
  quiropraxia: 'La Quiropraxia diagnostica y trata alteraciones de la columna vertebral y las articulaciones mediante ajustes manuales, mejorando la postura y la movilidad.',
  fisioterapia: 'La Fisioterapia previene, trata y rehabilita lesiones musculares y articulares mediante ejercicio terapéutico, terapia manual y agentes físicos.',
  nutricion: 'La Nutrición y Dietética Terapéutica diseña planes de alimentación personalizados para prevenir y tratar enfermedades como la diabetes o la hipertensión.',
  acupuntura: 'La Acupuntura estimula puntos específicos del cuerpo con agujas muy finas para aliviar el dolor, reducir el estrés y mejorar el bienestar general.'
};

const enlacesEspecialidad = document.querySelectorAll('#listaEspecialidades a');
const tarjetasMedicos = document.querySelectorAll('#listaMedicos > .col');
const parrafoDescripcion = document.getElementById('descripcionEspecialidad');

enlacesEspecialidad.forEach(enlace => {
  enlace.addEventListener('click', evento => {
    evento.preventDefault();
    const especialidad = enlace.dataset.especialidad;

    enlacesEspecialidad.forEach(e => e.classList.remove('active'));
    enlace.classList.add('active');

    parrafoDescripcion.textContent = descripciones[especialidad];

    tarjetasMedicos.forEach(tarjeta => {
      const mostrar = especialidad === 'todas' || tarjeta.dataset.especialidad === especialidad;
      tarjeta.classList.toggle('d-none', !mostrar);
    });
  });
});


// Los pacientes y las citas solo viven en memoria: al recargar o cerrar la página se pierden.
const HORARIOS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
let pacientes = [];
let citas = [];

// Fecha de hoy en formato AAAA-MM-DD según la hora local
function fechaDeHoy() {
  const hoy = new Date();
  hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
  return hoy.toISOString().slice(0, 10);
}

// Los inputs de tipo date usan AAAA-MM-DD; al usuario se le muestra DD-MM-AAAA
function formatearFecha(fecha) {
  return fecha.split('-').reverse().join('-');
}

function mostrarMensaje(elemento, tipo, texto) {
  elemento.className = 'alert alert-' + tipo;
  elemento.textContent = texto;
}

function ocultarMensaje(elemento) {
  elemento.className = 'alert d-none';
  elemento.textContent = '';
}

function abrirPestana(id) {
  bootstrap.Tab.getOrCreateInstance(document.getElementById(id)).show();
}


// Sección 3, pestaña 1: registro del paciente.
// Se valida al cambiar el foco de cada campo y al dar click en Registrar.
const formulario = document.getElementById('formRegistro');
const mensajePaciente = document.getElementById('mensajePaciente');

// Cada regla devuelve el mensaje de error, o '' si el campo está bien
const reglas = {
  nombres: v => !v.trim() ? 'Los nombres son obligatorios.'
    : !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/.test(v.trim()) ? 'Solo letras, mínimo 2 caracteres.' : '',
  apellidos: v => !v.trim() ? 'Los apellidos son obligatorios.'
    : !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/.test(v.trim()) ? 'Solo letras, mínimo 2 caracteres.' : '',
  tipoDocumento: v => !v ? 'Seleccione el tipo de documento.' : '',
  numeroDocumento: v => !v.trim() ? 'El número de documento es obligatorio.'
    : !/^\d{6,10}$/.test(v.trim()) ? 'Debe tener entre 6 y 10 dígitos.' : '',
  fechaNacimiento: v => {
    if (!v) return 'La fecha de nacimiento es obligatoria.';
    return new Date(v) >= new Date() ? 'La fecha debe ser anterior a hoy.' : '';
  },
  telefono: v => !v.trim() ? 'El celular es obligatorio.'
    : !/^3\d{9}$/.test(v.trim()) ? 'Debe tener 10 dígitos y empezar por 3.' : '',
  correo: v => !v.trim() ? 'El correo es obligatorio.'
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Ingrese un correo válido.' : '',
  contrasena: v => !v ? 'La contraseña es obligatoria.'
    : !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v) ? 'Mínimo 8 caracteres, con letras y números.' : '',
  confirmarContrasena: v => !v ? 'Confirme la contraseña.'
    : v !== formulario.contrasena.value ? 'Las contraseñas no coinciden.' : ''
};

// Pinta el campo en rojo o verde según la regla que le corresponda
function validarCampo(form, nombre, regla, idError) {
  const campo = form.elements[nombre];
  const mensaje = regla(campo.value);
  document.getElementById(idError).textContent = mensaje;
  campo.classList.toggle('is-invalid', mensaje !== '');
  campo.classList.toggle('is-valid', mensaje === '');
  return mensaje === '';
}

function validarCampoPaciente(nombre) {
  return validarCampo(formulario, nombre, reglas[nombre], 'error-' + nombre);
}

function validarSexo() {
  const ok = formulario.querySelector('input[name="sexo"]:checked') !== null;
  document.getElementById('error-sexo').textContent = ok ? '' : 'Seleccione una opción.';
  return ok;
}

Object.keys(reglas).forEach(nombre => {
  formulario.elements[nombre].addEventListener('blur', () => validarCampoPaciente(nombre));
});
formulario.tipoDocumento.addEventListener('change', () => validarCampoPaciente('tipoDocumento'));
formulario.querySelectorAll('input[name="sexo"]').forEach(r => r.addEventListener('change', validarSexo));

formulario.addEventListener('submit', evento => {
  evento.preventDefault();
  let valido = true;
  Object.keys(reglas).forEach(nombre => { valido = validarCampoPaciente(nombre) && valido; });
  valido = validarSexo() && valido;

  if (!valido) {
    ocultarMensaje(mensajePaciente);
    formulario.querySelector('.is-invalid')?.focus();
    return;
  }

  const tipoDocumento = formulario.tipoDocumento.value;
  const numeroDocumento = formulario.numeroDocumento.value.trim();
  const correo = formulario.correo.value.trim().toLowerCase();

  // El documento y el correo no pueden repetirse
  if (pacientes.some(p => p.tipoDocumento === tipoDocumento && p.numeroDocumento === numeroDocumento)) {
    mostrarMensaje(mensajePaciente, 'warning', 'Ya existe un paciente registrado con ese documento.');
    return;
  }
  if (pacientes.some(p => p.correo === correo)) {
    mostrarMensaje(mensajePaciente, 'warning', 'Ese correo ya está registrado con otro paciente.');
    return;
  }

  // La contraseña no se guarda porque la página no tiene inicio de sesión que la use
  const paciente = {
    id: Date.now(),
    nombres: formulario.nombres.value.trim(),
    apellidos: formulario.apellidos.value.trim(),
    tipoDocumento,
    numeroDocumento,
    fechaNacimiento: formulario.fechaNacimiento.value,
    sexo: formulario.querySelector('input[name="sexo"]:checked').value,
    telefono: formulario.telefono.value.trim(),
    correo
  };
  pacientes.push(paciente);

  formulario.reset();
  mostrarMensaje(mensajePaciente, 'success',
    paciente.nombres + ' ' + paciente.apellidos + ' quedó registrado(a). Ya puedes agendarle una cita en la pestaña "Agendar cita".');
  actualizarPacientes();
  formCita.paciente.value = paciente.id;
});

// Al limpiar se borran también los mensajes de error
formulario.addEventListener('reset', () => {
  formulario.querySelectorAll('.is-invalid, .is-valid').forEach(c => c.classList.remove('is-invalid', 'is-valid'));
  formulario.querySelectorAll('[id^="error-"]').forEach(e => e.textContent = '');
});


// Sección 3, pestaña 2: agendar la cita.
// Se escoge el paciente y el médico (si no se escogió desde la carta del médico).
const formCita = document.getElementById('formCita');
const mensajeCita = document.getElementById('mensajeCita');
formCita.fecha.min = fechaDeHoy();

function nombrePaciente(id) {
  const p = pacientes.find(p => p.id === id);
  return p ? p.nombres + ' ' + p.apellidos : 'Paciente eliminado';
}

function nombreMedico(id) {
  const opcion = formCita.medico.querySelector('option[value="' + id + '"]');
  return opcion ? opcion.textContent : '';
}

function horarioOcupado(medicoId, fecha, hora) {
  return citas.some(c => c.medicoId === medicoId && c.fecha === fecha && c.hora === hora);
}

function horaYaPaso(fecha, hora) {
  return fecha === fechaDeHoy() && hora <= new Date().toTimeString().slice(0, 5);
}

// Llena el select de horas y deshabilita las que no se pueden escoger
function actualizarHoras() {
  const seleccionada = formCita.hora.value;
  const medicoId = Number(formCita.medico.value);
  const fecha = formCita.fecha.value;
  formCita.hora.innerHTML = '<option value="">Seleccione...</option>';
  HORARIOS.forEach(hora => {
    const noDisponible = fecha !== '' && (horaYaPaso(fecha, hora) || horarioOcupado(medicoId, fecha, hora));
    const opcion = new Option(hora + (noDisponible ? ' (no disponible)' : ''), hora);
    opcion.disabled = noDisponible;
    formCita.hora.add(opcion);
  });
  const sigueDisponible = [...formCita.hora.options].some(o => o.value === seleccionada && !o.disabled);
  formCita.hora.value = sigueDisponible ? seleccionada : '';
}

const reglasCita = {
  paciente: v => !v ? 'Seleccione el paciente.' : '',
  medico: v => !v ? 'Seleccione el médico.' : '',
  fecha: v => !v ? 'Seleccione la fecha de la cita.' : v < fechaDeHoy() ? 'La fecha no puede ser anterior a hoy.' : '',
  hora: v => !v ? 'Seleccione la hora de la cita.' : ''
};

function validarCampoCita(nombre) {
  return validarCampo(formCita, nombre, reglasCita[nombre], 'error-cita-' + nombre);
}

Object.keys(reglasCita).forEach(nombre => {
  formCita.elements[nombre].addEventListener('blur', () => validarCampoCita(nombre));
  formCita.elements[nombre].addEventListener('change', () => validarCampoCita(nombre));
});
formCita.medico.addEventListener('change', actualizarHoras);
formCita.fecha.addEventListener('change', actualizarHoras);

formCita.addEventListener('submit', evento => {
  evento.preventDefault();
  let valido = true;
  Object.keys(reglasCita).forEach(nombre => { valido = validarCampoCita(nombre) && valido; });
  if (!valido) {
    ocultarMensaje(mensajeCita);
    return;
  }

  const cita = {
    id: Date.now(),
    pacienteId: Number(formCita.paciente.value),
    medicoId: Number(formCita.medico.value),
    fecha: formCita.fecha.value,
    hora: formCita.hora.value,
    motivo: formCita.motivo.value.trim()
  };

  if (horarioOcupado(cita.medicoId, cita.fecha, cita.hora)) {
    mostrarMensaje(mensajeCita, 'warning', 'El médico ya tiene una cita en ese horario. Escoge otra hora.');
    return;
  }
  if (citas.some(c => c.pacienteId === cita.pacienteId && c.fecha === cita.fecha && c.hora === cita.hora)) {
    mostrarMensaje(mensajeCita, 'warning', 'El paciente ya tiene otra cita en esa misma fecha y hora.');
    return;
  }

  citas.push(cita);
  mostrarMensaje(mensajeCita, 'success',
    'Cita agendada para ' + nombrePaciente(cita.pacienteId) + ' con ' + nombreMedico(cita.medicoId) +
    ' el ' + formatearFecha(cita.fecha) + ' a las ' + cita.hora + '. Puedes verla en "Citas registradas".');
  formCita.reset();
  actualizarCitas();
});

formCita.addEventListener('reset', () => {
  formCita.querySelectorAll('.is-invalid, .is-valid').forEach(c => c.classList.remove('is-invalid', 'is-valid'));
  formCita.querySelectorAll('[id^="error-cita-"]').forEach(e => e.textContent = '');
  setTimeout(actualizarHoras); // se espera a que el formulario termine de limpiarse
});

// Botón "Agendar Cita" de cada médico: abre la pestaña con el médico ya escogido
document.querySelectorAll('.btn-agendar').forEach(boton => {
  boton.addEventListener('click', () => {
    formCita.medico.value = boton.dataset.medico;
    ocultarMensaje(mensajeCita);
    actualizarHoras();
    abrirPestana('tab-cita');
  });
});


// Sección 3, pestaña 3: lista de citas y pacientes

function crearCelda(fila, texto) {
  const celda = fila.insertCell();
  celda.textContent = texto;
  return celda;
}

function actualizarCitas() {
  const cuerpo = document.querySelector('#tablaCitas tbody');
  cuerpo.innerHTML = '';
  const ordenadas = [...citas].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  ordenadas.forEach(cita => {
    const fila = cuerpo.insertRow();
    crearCelda(fila, formatearFecha(cita.fecha)).className = 'text-nowrap';
    crearCelda(fila, cita.hora);
    crearCelda(fila, nombrePaciente(cita.pacienteId));
    crearCelda(fila, nombreMedico(cita.medicoId));
    crearCelda(fila, cita.motivo || '-');

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'btn btn-outline-danger btn-sm';
    boton.textContent = 'Cancelar';
    boton.addEventListener('click', () => {
      citas = citas.filter(c => c.id !== cita.id);
          actualizarCitas();
    });
    fila.insertCell().appendChild(boton);
  });

  document.getElementById('tablaCitas').classList.toggle('d-none', citas.length === 0);
  document.getElementById('sinCitas').classList.toggle('d-none', citas.length > 0);
  document.getElementById('contadorCitas').textContent = citas.length;
  actualizarHoras();
  actualizarListaPacientes();
}

function actualizarListaPacientes() {
  const lista = document.getElementById('listaPacientes');
  lista.innerHTML = '';
  pacientes.forEach(p => {
    const item = document.createElement('li');
    item.className = 'list-group-item d-flex justify-content-between align-items-center';

    const datos = document.createElement('span');
    const cantidad = citas.filter(c => c.pacienteId === p.id).length;
    datos.textContent = p.nombres + ' ' + p.apellidos + ' - ' + p.tipoDocumento + ' ' + p.numeroDocumento +
      ' - ' + p.correo + ' (' + cantidad + ' cita(s))';

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'btn btn-outline-secondary btn-sm';
    boton.title = 'Eliminar paciente y sus citas';
    boton.innerHTML = '<i class="bi bi-trash3"></i>';
    boton.addEventListener('click', () => {
      pacientes = pacientes.filter(x => x.id !== p.id);
      citas = citas.filter(c => c.pacienteId !== p.id);
              actualizarPacientes();
    });

    item.append(datos, boton);
    lista.appendChild(item);
  });
  document.getElementById('sinPacientesLista').classList.toggle('d-none', pacientes.length > 0);
}

// Refresca el select de pacientes del formulario de citas y las listas
function actualizarPacientes() {
  const seleccionado = formCita.paciente.value;
  formCita.paciente.innerHTML = '<option value="">Seleccione...</option>';
  pacientes.forEach(p => {
    formCita.paciente.add(new Option(p.nombres + ' ' + p.apellidos + ' (' + p.tipoDocumento + ' ' + p.numeroDocumento + ')', p.id));
  });
  formCita.paciente.value = pacientes.some(p => String(p.id) === seleccionado) ? seleccionado : '';

  const hayPacientes = pacientes.length > 0;
  document.getElementById('sinPacientes').classList.toggle('d-none', hayPacientes);
  formCita.classList.toggle('d-none', !hayPacientes);
  actualizarCitas();
}

// Estado inicial: sin pacientes ni citas
actualizarPacientes();
