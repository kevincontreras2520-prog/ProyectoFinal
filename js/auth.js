let avatarSeleccionado = '😀';

function seleccionarAvatar(emoji) {
    avatarSeleccionado = emoji;
    document.querySelectorAll('#avatarPicker .avatar-item').forEach(el => {
        el.classList.toggle('seleccionado', el.innerText === emoji);
    });
}

function registrarUsuario() {
    const nombre = document.getElementById('auth-nombre').value;
    const correo = document.getElementById('auth-correo').value;
    const password = document.getElementById('auth-password').value;

    if (!nombre || !correo || !password) return alert("Llena todos los campos.");

    fetch('api/index.php?modulo=auth&accion=registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, password, avatar: avatarSeleccionado })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.mensaje);
        if (!data.error) {
            window.location.href = 'login.php';
        }
    })
    .catch(err => {
        alert("⚠️ Error al procesar el registro en el servidor.");
        console.error(err);
    });
}

function iniciarSesion() {
    const correo = document.getElementById('auth-correo').value;
    const password = document.getElementById('auth-password').value;

    if (!correo || !password) return alert("Ingresa tu correo y contraseña.");

    fetch('api/index.php?modulo=auth&accion=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ correo, password })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.error) {
            alert(data.mensaje);
            window.location.href = 'principal.php';
        } else {
            alert(data.mensaje);
        }
    });
}

function cerrarSesion() {
    fetch('api/index.php?modulo=auth&accion=logout', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            alert(data.mensaje);
            window.location.href = 'login.php';
        });
}

function verificarAccesoPrincipal() {
    fetch('api/index.php?modulo=auth&accion=verificar_sesion', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (!data.autenticado) {
                alert("Debes iniciar sesión primero.");
                window.location.href = 'login.php';
            } else {
                const nombreEl = document.getElementById('user-nombre');
                const avatarEl = document.getElementById('user-avatar');
                const rolEl = document.getElementById('user-rol');

                if (nombreEl) nombreEl.innerText = data.usuario.nombre;
                if (avatarEl) avatarEl.innerText = data.usuario.avatar || '😀';
                if (rolEl) rolEl.innerText = data.usuario.rol.toUpperCase();
            }
        })
        .catch(err => console.error("Error al verificar sesión:", err));
}
