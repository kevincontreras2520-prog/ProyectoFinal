let chatActivo = { tipo: 'group', destinatarioId: null, nombre: 'Sala General' };

function tiempoHumano(fechaStr) {
    if (!fechaStr) return '';
    // Convertimos la fecha de MySQL a un formato que JS entienda
    const fecha = new Date(fechaStr.replace(' ', 'T')); 
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} horas`;
    
    // Si pasó más de un día, mostramos la fecha normal
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Función para evitar inyección de código (XSS)
function escaparHTML(str) {
    return String(str || '').replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

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
                    <span class="user-avatar">💬</span> 
                    <div class="user-info"><b>Sala General</b></div>
                </div>`;

            if (data.usuarios) {
                data.usuarios.forEach(u => {
                    if (u.id == data.usuario_actual_id) return;
                    
                    let adminBtns = '';
                    if (data.es_admin && u.rol !== 'admin') {
                        const esBaneado = parseInt(u.baneado) === 1;
                        adminBtns = `
                            <div class="user-actions">
                                <button onclick="event.stopPropagation(); banearUsuario(${u.id}, ${esBaneado ? 0 : 1})" class="btn btn-primary btn-sm" style="padding: 2px 6px; font-size: 10px;">${esBaneado ? 'Activar' : 'Banear'}</button>
                                <button onclick="event.stopPropagation(); eliminarUsuario(${u.id})" class="btn btn-danger btn-sm" style="padding: 2px 6px; font-size: 10px; margin-left: 3px;">🗑️</button>
                            </div>`;
                    }

                    const esSeleccionado = chatActivo.tipo === 'private' && chatActivo.destinatarioId == u.id;
                    
                    // --- NUEVO: Lógica para saber si hay mensajes sin leer ---
                    const tieneNoLeidos = parseInt(u.no_leidos) > 0;
                    const estiloNombre = tieneNoLeidos ? 'font-weight: 900; color: #000;' : 'font-weight: normal;';

                    html += `
                        <div class="item-usuario-chat ${esSeleccionado ? 'activo' : ''}" onclick="seleccionarChat('private', ${u.id}, '${escaparHTML(u.nombre)}')">
                            <span class="user-avatar">${u.avatar || '👤'}</span> 
                            <div class="user-info">
                                <b style="${estiloNombre}">${escaparHTML(u.nombre)}</b> 
                                ${parseInt(u.baneado) === 1 ? '<small style="color:#dc3545; font-size:10px; display:block;">(Baneado)</small>' : ''}
                                ${tieneNoLeidos ? '<small style="color:#007bff; font-size:10px; display:block;">● Nuevo mensaje</small>' : ''}
                            </div>
                            ${adminBtns}
                        </div>`;
                });
            }
            caja.innerHTML = html;
        })
        .catch(err => console.error("Error cargando usuarios:", err));
}

function seleccionarChat(tipo, id, nombre) {
    chatActivo = { tipo: tipo, destinatarioId: id, nombre: nombre };
    const titulo = document.getElementById('chat-titulo');
    if (titulo) titulo.innerText = tipo === 'group' ? '💬 Sala General' : `🔒 Chat Privado con ${nombre}`;
    const caja = document.getElementById('chat-box');
    if (caja) caja.innerHTML = '<small style="color:gray;">Cargando conversación...</small>';
    
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
                    banner.innerHTML = `📌 <b>Mensaje Fijado (${escaparHTML(data.fijado.nombre)}):</b> ${escaparHTML(data.fijado.mensaje)}`;
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
                            adminAcciones += `<button onclick="fijarMensaje(${msg.id})" class="btn btn-primary btn-sm" style="padding: 2px 6px; font-size: 10px;">📌</button>`;
                        }
                        adminAcciones += `<button onclick="borrarMensaje(${msg.id})" class="btn btn-danger btn-sm" style="padding: 2px 6px; font-size: 10px; margin-left: 3px;">🗑️</button>`;
                    }

                    caja.innerHTML += `
                        <div class="mensaje-burbuja ${esMio ? 'propio' : ''}">
                            <small><b>${msg.avatar || '👤'} ${escaparHTML(msg.nombre)}</b></small>
                            <div>${escaparHTML(msg.mensaje)}</div>
                            ${adminAcciones ? `<div style="margin-top: 5px; text-align: right;">${adminAcciones}</div>` : ''}
                        </div>`;
                });
                caja.scrollTop = caja.scrollHeight;
            } else {
                caja.innerHTML = '<small style="color:gray;">No hay mensajes en esta conversación. ¡Escribe el primero!</small>';
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

    // --- NUEVO: Verificar si el usuario actual está baneado en la lista ---
    const listaUsuarios = document.querySelectorAll('.item-usuario-chat');
    // (Esta es una validación opcional en JS, pero el backend ya lo bloquea de todas formas)
    // --------------------------------------------------
    
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

function eliminarUsuario(id) {
    if (!confirm("¿Estás seguro de eliminar esta cuenta? Se borrarán todos sus mensajes, posts y comentarios.")) return;
    fetch('api/index.php?modulo=chat&accion=admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sub_accion: 'borrar_usuario', usuario_id: id })
    })
    .then(res => res.json())
    .then(data => {
        if(data.error) alert(data.mensaje);
        else cargarUsuarios();
    });
}
