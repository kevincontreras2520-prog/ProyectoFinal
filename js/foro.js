let temaActualId = null;

function cargarHilos() {
    // Ocultar la vista de respuestas y mostrar la lista de temas
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

            caja.innerHTML = '';
            
            if (data.hilos && data.hilos.length > 0) {
                data.hilos.forEach(hilo => {
                    // Usamos data-titulo para no romper el HTML con títulos especiales
                    caja.innerHTML += `
                        <div class="tarjeta-post" style="padding: 15px; margin-bottom: 15px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='scale(1)'">
                            
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                <!-- El clic para abrir el tema está en el título -->
                                <h3 style="margin: 0; color: #007bff; flex: 1;" onclick="abrirTema(${hilo.id}, this.innerText)">${hilo.titulo}</h3>
                                
                                <div style="display: flex; gap: 8px; flex-shrink: 0;">
                                    <button onclick="abrirTema(${hilo.id}, this.parentElement.parentElement.querySelector('h3').innerText)" class="btn btn-primary btn-sm">💬 Ver Hilo</button>
                                    <button onclick="borrarHilo(${hilo.id})" class="btn btn-danger btn-sm">🗑️</button>
                                </div>
                            </div>

                            <p style="margin-top: 0; margin-bottom: 10px; color: #444;">${hilo.contenido}</p>
                            <small style="color:gray;">Creado por <b>${hilo.avatar || '👤'} ${hilo.nombre || hilo.autor}</b> el ${hilo.fecha_creacion}</small>
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

// ==========================================
// NUEVAS FUNCIONES PARA LOS HILOS (RESPUESTAS)
// ==========================================

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
                    caja.innerHTML += `
                        <div style="background:#f9f9f9; padding:15px; border-radius:8px; margin-bottom:10px; border:1px solid #eee;">
                            <div style="margin-bottom: 5px;">
                                <b>${resp.avatar || '👤'} ${resp.nombre}</b> 
                                <small style="color:#888; margin-left: 10px;">${resp.fecha_creacion}</small>
                            </div>
                            <div style="color:#333;">${resp.contenido}</div>
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
