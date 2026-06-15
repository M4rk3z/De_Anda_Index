async function login(event) {
  event.preventDefault();

  const usuario = document.getElementById('loginUsuario').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const status = document.getElementById('loginStatus');

  status.textContent = 'Validando usuario...';
  status.style.color = '#111827';

  try {
    const { data, error } = await supabaseClient
      .from('Usuarios_Login')
      .select('id, User_Nombre, User_Pass')
      .ilike('User_Nombre', usuario)
      .maybeSingle();

    console.log('USUARIO ENCONTRADO:', data);
    console.log('ERROR LOGIN:', error);

    if (error) {
      status.textContent = 'Error al consultar usuarios: ' + error.message;
      status.style.color = '#b91c1c';
      return;
    }

    if (!data) {
      status.textContent = 'Usuario no encontrado.';
      status.style.color = '#b91c1c';
      return;
    }

    if (String(data.User_Pass).trim() !== password) {
      status.textContent = 'Contraseña incorrecta.';
      status.style.color = '#b91c1c';
      return;
    }

    status.textContent = 'Acceso correcto. Entrando...';
    status.style.color = '#15803d';

    localStorage.setItem('sesionActiva', 'true');
    localStorage.setItem('usuarioActivo', data.User_Nombre);
    localStorage.setItem('usuarioId', data.id);

    entrarAlSistema();
  } catch (error) {
    console.error(error);
    status.textContent = 'No se pudo iniciar sesion: ' + error.message;
    status.style.color = '#b91c1c';
  }
}

function entrarAlSistema() {
  const loginScreen = document.getElementById('loginScreen');
  const appScreen = document.getElementById('appScreen');
  const viewer = document.getElementById('viewer');
  const usuarioActivo = localStorage.getItem('usuarioActivo') || 'Usuario';

  if (!loginScreen || !appScreen) {
    alert('Falta loginScreen o appScreen en el HTML.');
    return;
  }

  loginScreen.style.display = 'none';
  appScreen.style.display = 'flex';

  if (viewer) {
    viewer.innerHTML = `
      <h2>Bienvenido, ${usuarioActivo}</h2>
      <p>Acceso correcto. Selecciona una opcion del menu para continuar.</p>
    `;
  }
}

function cerrarSesion() {
  localStorage.removeItem('sesionActiva');
  localStorage.removeItem('usuarioActivo');
  localStorage.removeItem('usuarioId');

  const appScreen = document.getElementById('appScreen');
  const loginScreen = document.getElementById('loginScreen');
  const usuarioInput = document.getElementById('loginUsuario');
  const passwordInput = document.getElementById('loginPassword');
  const status = document.getElementById('loginStatus');

  if (appScreen) {
    appScreen.style.display = 'none';
  }

  if (loginScreen) {
    loginScreen.style.display = 'grid';
  }

  if (usuarioInput) {
    usuarioInput.value = '';
  }

  if (passwordInput) {
    passwordInput.value = '';
  }

  if (status) {
    status.textContent = '';
  }
}