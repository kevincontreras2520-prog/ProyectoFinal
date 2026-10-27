let temaActualId = null;
let esAdminGlobal = false; // Variable global para saber si es admin

// Función para evitar inyección de código (XSS)
function escaparHTML(str) {
    return String(str || '').replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

function cargarHilos() {
    const vistaTemas = document.getElementById('vista-temas');
    const vistaRespuestas = document.getElementById('vista-respuestas');
    if (vistaTemas) vistaTemas.style.display = 'block';
    if (vistaRespuestas) vistaRespuestas.style.display = 'none';

    fetch('api/index.php?modulo=foro&accion=leer', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.error) return;
            const caja = document.getElementById('foro-box');
            if (!caja) return;

            // Guardamos si el usuario actual es admin
            esAdminGlobal = data.es_admin || false;

            caja.innerHTML = '';
            
            if (data.hilos && data.hilos.length > 0) {
                data.hilos.forEach(hilo => {
                    // Lógica del botón de borrar tema
                    const btnBorrarHilo = esAdminGlobal ? `<button onclick="borrarHilo(${hilo.id})" class="btn btn-danger btn-sm">🗑️</button>` : '';

                    caja.innerHTML += `
                        <div class="tarjeta-post" style="padding: 15px; margin-bottom: 15px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='scale(1)'">
                            
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                <h3 style="margin: 0; color: #007bff; flex: 1;" onclick="abrirTema(${hilo.id}, this.innerText)">${escaparHTML(hilo.titulo)}</h3>
                                
                                <div style="display: flex; gap: 8px; flex-shrink: 0;">
                                    <button onclick="abrirTema(${hilo.id}, this.parentElement.parentElement.querySelector('h3').innerText)" class="btn btn-primary btn-sm">💬 Ver Hilo</button>
                                    ${btnBorrarHilo}
                                </div>
                            </div>

                            <p style="margin-top: 0; margin-bottom: 10px; color: #444;">${escaparHTML(hilo.contenido)}</p>
                            <small style="color:gray;">Creado por <b>${hilo.avatar || '👤'} ${escaparHTML(hilo.nombre || hilo.autor)}</b> el ${hilo.fecha_creacion}</small>
                        </div>`;
                });
            } else {
                caja.innerHTML = '<p style="color:gray;">No hay temas de debate aún. ¡Crea el primero arriba!</p>';
            }
        });
}

function crearHilo() {
    const titulo = document.getElementById('foro-titulo').value;
    const contenido = document.getElementById('foro-contenido').value;

    if (!titulo || !contenido) return alert("Ingresa el título y el contenido del tema.");

    fetch('api/index.php?modulo=foro&accion=crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titulo, contenido })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.error) {
            document.getElementById('foro-titulo').value = '';
            document.getElementById('foro-contenido').value = '';
            cargarHilos();
        } else {
            alert(data.mensaje || "Error al crear el tema.");
        }
    });
}

function borrarHilo(id) {
    if (!confirm("¿Eliminar este tema del foro permanentemente?")) return;
    
    fetch('api/index.php?modulo=foro&accion=borrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ hilo_id: id })
    })
    .then(res => res.json())
    .then(data => { 
        if (!data.error) cargarHilos(); 
        else alert(data.mensaje);
    });
}

function abrirTema(id, titulo) {
    temaActualId = id;
    document.getElementById('vista-temas').style.display = 'none';
    document.getElementById('vista-respuestas').style.display = 'block';
    
    document.getElementById('titulo-tema-actual').innerText = "Tema: " + titulo;
    cargarRespuestas(id);
}

function volverATemas() {
    temaActualId = null;
    cargarHilos();
}

function cargarRespuestas(tema_id) {
    const caja = document.getElementById('lista-respuestas');
    if (!caja) return;
    caja.innerHTML = '<p style="color:gray;">Cargando respuestas...</p>';

    fetch(`api/index.php?modulo=foro&accion=leer_respuestas&tema_id=${tema_id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                caja.innerHTML = `<p style="color:red;">${data.mensaje}</p>`;
                return;
            }

            caja.innerHTML = '';
            if (data.respuestas && data.respuestas.length > 0) {
                data.respuestas.forEach(resp => {
                    // Lógica del botón de borrar respuesta
                    const btnBorrarResp = esAdminGlobal ? `<button onclick="borrarRespuesta(${resp.id})" class="btn btn-danger btn-sm" style="position: absolute; right: 10px; top: 10px; padding: 0 5px; font-size: 10px;">x</button>` : '';

                    caja.innerHTML += `
                        <div style="background:#f9f9f9; padding:15px; border-radius:8px; margin-bottom:10px; border:1px solid #eee; position: relative;">
                            <div style="margin-bottom: 5px; padding-right: 30px;">
                                <b>${resp.avatar || '👤'} ${escaparHTML(resp.nombre)}</b> 
                                <small style="color:#888; margin-left: 10px;">${resp.fecha_creacion}</small>
                                ${btnBorrarResp}
                            </div>
                            <div style="color:#333;">${escaparHTML(resp.contenido)}</div>
                        </div>`;
                });
            } else {
                caja.innerHTML = '<p style="color:gray;">No hay respuestas en este tema. ¡Sé el primero en responder!</p>';
            }
        });
}

function enviarRespuesta() {
    if (!temaActualId) return;
    const input = document.getElementById('nueva-respuesta');
    const contenido = input.value.trim();

    if (!contenido) return alert("Escribe una respuesta.");

    fetch('api/index.php?modulo=foro&accion=crear_respuesta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tema_id: temaActualId, contenido: contenido })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.error) {
            input.value = '';
            cargarRespuestas(temaActualId);
        } else {
            alert(data.mensaje);
        }
    });
}

function borrarRespuesta(id) {
    if (!confirm("¿Eliminar esta respuesta del foro?")) return;
    
    fetch('api/index.php?modulo=foro&accion=borrar_respuesta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comentario_id: id })
    })
    .then(res => res.json())
    .then(data => { 
        if (!data.error) {
            cargarRespuestas(temaActualId); 
        } else {
            alert(data.mensaje);
        }
    });
}
