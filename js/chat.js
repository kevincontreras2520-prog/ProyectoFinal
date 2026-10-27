let chatActivo = { tipo: 'group', destinatarioId: null, nombre: 'Sala General' };

function inicializarChat() {
    cargarUsuarios();
    cargarMensajes();
    setInterval(cargarMensajes, 3000);
    setInterval(cargarUsuarios, 5000);
}

function cargarUsuarios() {
    fetch('api/index.php?modulo=chat&accion=usuarios', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.error) return;
            const caja = document.getElementById('lista-usuarios');
            if (!caja) return;

            let html = `
                <div class="item-usuario-chat ${chatActivo.tipo === 'group' ? 'activo' : ''}" onclick="seleccionarChat('group', null, 'Sala General')">
                    <span>💬</span> <b>Sala General</b>
                </div>`;

            if (data.usuarios) {
                data.usuarios.forEach(u => {
                    if (u.id == data.usuario_actual_id) return;
                    
                    let adminBtns = '';
                    if (data.es_admin && u.rol !== 'admin') {
                        const esBaneado = parseInt(u.baneado) === 1;
                        adminBtns = `<button onclick="event.stopPropagation(); banearUsuario(${u.id}, ${esBaneado ? 0 : 1})" class="btn btn-danger btn-sm">${esBaneado ? 'Restablecer' : 'Banear'}</button>`;
                    }

                    const esSeleccionado = chatActivo.tipo === 'private' && chatActivo.destinatarioId == u.id;

                    html += `
                        <div class="item-usuario-chat ${esSeleccionado ? 'activo' : ''}" onclick="seleccionarChat('private', ${u.id}, '${u.nombre}')">
                            <span>${u.avatar || '👤'}</span> 
                            <div style="flex:1;"><b>${u.nombre}</b> ${parseInt(u.baneado) === 1 ? '<small style="color:red;">(Baneado)</small>' : ''}</div>
                            ${adminBtns}
                        </div>`;
                });
            }
            caja.innerHTML = html;
        });
}

function seleccionarChat(tipo, id, nombre) {
    chatActivo = { tipo: tipo, destinatarioId: id, nombre: nombre };
    
    const titulo = document.getElementById('chat-titulo');
    if (titulo) {
        titulo.innerText = tipo === 'group' ? '💬 Sala General' : `🔒 Chat Privado con ${nombre}`;
    }

    const caja = document.getElementById('chat-box');
    if (caja) {
        caja.innerHTML = '<small style="color:gray;">Cargando conversación...</small>';
    }

    cargarUsuarios();
    cargarMensajes();
}

function cargarMensajes() {
    let url = `api/index.php?modulo=chat&accion=leer&tipo=${chatActivo.tipo}`;
    if (chatActivo.tipo === 'private' && chatActivo.destinatarioId) {
        url += `&destinatario_id=${chatActivo.destinatarioId}`;
    }

    fetch(url, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            const caja = document.getElementById('chat-box');
            if (!caja) return;

            if (data.error) {
                caja.innerHTML = `<small style="color:red;">⚠️ ${data.mensaje}</small>`;
                return;
            }

            const banner = document.getElementById('banner-fijado');
            if (banner) {
                if (data.fijado && chatActivo.tipo === 'group') {
                    banner.innerHTML = `📌 <b>Mensaje Fijado (${data.fijado.nombre}):</b> ${data.fijado.mensaje}`;
                    banner.style.display = 'block';
                } else {
                    banner.style.display = 'none';
                }
            }

            caja.innerHTML = '';
            
            if (data.mensajes && data.mensajes.length > 0) {
                data.mensajes.forEach(msg => {
                    const esMio = msg.usuario_id == data.usuario_actual_id;
                    
                    let adminAcciones = '';
                    if (data.es_admin) {
                        if (chatActivo.tipo === 'group') {
                            adminAcciones += `<button onclick="fijarMensaje(${msg.id})" class="btn btn-primary btn-sm">📌</button>`;
                        }
                        adminAcciones += `<button onclick="borrarMensaje(${msg.id})" class="btn btn-danger btn-sm">🗑️</button>`;
                    }

                    caja.innerHTML += `
    <div class="mensaje-burbuja ${esMio ? 'propio' : ''}">
        <small><b>${msg.avatar || '👤'} ${msg.nombre}</b></small>
        <div>${msg.mensaje}</div>
        ${adminAcciones ? `<div style="margin-top: 5px; text-align: right;">${adminAcciones}</div>` : ''}
    </div>`;
                });
                caja.scrollTop = caja.scrollHeight;
            } else {
                caja.innerHTML = '<small style="color:gray;">No hay mensajes en esta conversación privada. ¡Escribe el primero!</small>';
            }
        })
        .catch(err => {
            const caja = document.getElementById('chat-box');
            if (caja) caja.innerHTML = `<small style="color:red;">⚠️ Error al conectar con la API central.</small>`;
        });
}

function enviarMensaje() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const mensaje = input.value.trim();
    if (!mensaje) return;

    const payload = {
        mensaje: mensaje,
        destinatario_id: chatActivo.tipo === 'private' ? chatActivo.destinatarioId : null
    };

    fetch('api/index.php?modulo=chat&accion=enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (!data.error) {
            input.value = '';
            cargarMensajes();
        } else {
            alert(data.mensaje);
        }
    });
}

function fijarMensaje(id) {
    fetch('api/index.php?modulo=chat&accion=admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sub_accion: 'fijar', mensaje_id: id })
    }).then(() => cargarMensajes());
}

function borrarMensaje(id) {
    if (!confirm("¿Borrar mensaje?")) return;
    fetch('api/index.php?modulo=chat&accion=admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sub_accion: 'borrar_mensaje', mensaje_id: id })
    }).then(() => cargarMensajes());
}

function banearUsuario(id, estado) {
    if (!confirm(estado === 1 ? "¿Banear usuario?" : "¿Restablecer usuario?")) return;
    fetch('api/index.php?modulo=chat&accion=admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sub_accion: 'toggle_ban', usuario_id: id, baneado: estado })
    }).then(() => cargarUsuarios());
}
