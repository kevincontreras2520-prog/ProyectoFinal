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
                            <h3 style="margin-top:0;">${hilo.titulo}</h3>
                            <p>${hilo.contenido}</p>
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