function cargarHilos() {
    fetch('api/index.php?modulo=foro&accion=leer', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.error) return;
            const caja = document.getElementById('foro-box');
            if (!caja) return;

            caja.innerHTML = '';
            
            if (data.hilos && data.hilos.length > 0) {
                data.hilos.forEach(hilo => {
                    caja.innerHTML += `
                        <div style="background:#fff; padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid #ddd;">
                            
                            <!-- Usamos Flexbox para que el título y el botón se acomoden solos -->
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                <h3 style="margin: 0; color: #1a1a1a;">${hilo.titulo}</h3>
                                <button onclick="borrarHilo(${hilo.id})" class="btn btn-danger btn-sm" style="flex-shrink: 0; margin-left: 15px;">🗑️ Borrar</button>
                            </div>
                            
                            <p style="margin-top: 0; margin-bottom: 10px; color: #444; line-height: 1.5;">${hilo.contenido}</p>
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
        if (!data.error) {
            cargarHilos(); 
        } else {
            alert(data.mensaje);
        }
    });
}
