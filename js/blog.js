let cachePosts = '';
let cacheComentarios = {};

function cargarPosts() {
    const cursor = document.activeElement;
    if (cursor && cursor.id && cursor.id.includes('comentario')) return;

    fetch('api/index.php?modulo=blog&accion=leer', { credentials: 'include' })
        .then(res => res.json())
        .then(response => {
            const posts = response.posts || response;
            if (!Array.isArray(posts)) return;

            const caja = document.getElementById('blog-box');
            if (!caja) return;
            caja.innerHTML = '';

            if (posts.length === 0) {
                caja.innerHTML = '<p style="text-align:center; color:gray;">No hay publicaciones aún. ¡Sé el primero en escribir!</p>';
                return;
            }

            posts.forEach(post => {
                // Convertimos los saltos de línea en <br> para que se lean bien los párrafos
                const contenidoFormateado = post.contenido.replace(/\n/g, '<br>');

                caja.innerHTML += `
                    <div class="tarjeta-post">
                        <div class="post-header">
                            <div class="post-avatar">${post.avatar || '👤'}</div>
                            <div class="post-info">
                                <b>${post.nombre || post.autor}</b>
                                <small>${post.fecha_creacion}</small>
                            </div>
                        </div>
                        
                        <div class="post-body">
                            <!-- Título corregido y botón de borrar post -->
                            <h3 class="post-titulo">${post.titulo} 
                                <button onclick="borrarPost(${post.id})" class="btn btn-danger btn-sm" style="float: right;">🗑️ Borrar Post</button>
                            </h3>
                            <p class="post-contenido">${contenidoFormateado}</p>
                        </div>
                        
                        <div class="post-comentarios">
                            <div id="comentarios-post-${post.id}"><i style="color:gray; font-size:13px;">Cargando comentarios...</i></div>
                            
                            <div class="input-comentario">
                                <input type="text" id="texto-comentario-${post.id}" placeholder="Escribe un comentario..." maxlength="500">
                                <input type="hidden" id="padre-comentario-${post.id}" value="">
                                <button onclick="enviarComentario(${post.id})" class="btn btn-primary">Comentar</button>
                            </div>
                        </div>
                    </div>`;
                cargarComentarios(post.id);
            });
        });
}

function cargarComentarios(postId) {
    fetch(`api/index.php?modulo=blog&accion=leer_comentarios&post_id=${postId}`, { credentials: 'include' })
        .then(res => res.json())
        .then(response => {
            const comentarios = response.comentarios || [];
            const caja = document.getElementById(`comentarios-post-${postId}`);
            if (!caja) return;
            caja.innerHTML = '';

            comentarios.forEach(com => {
                // Botón para borrar comentario principal
                caja.innerHTML += `
                    <div class="comentario-padre">
                        <b>${com.avatar || '👤'} ${com.nombre}:</b> ${com.contenido}
                        <button onclick="borrarComentario(${com.id}, ${postId})" class="btn btn-danger btn-sm" style="float: right; padding: 0 5px; font-size: 10px; line-height: 1.5;">x</button>
                    </div>`;
            });
        });
}

function prepararRespuesta(postId, padreId, autor) {
    document.getElementById(`padre-comentario-${postId}`).value = padreId;
    const input = document.getElementById(`texto-comentario-${postId}`);
    input.value = `@${autor} `;
    input.focus();
}

function enviarComentario(postId) {
    const contenido = document.getElementById(`texto-comentario-${postId}`).value;
    const padreId = document.getElementById(`padre-comentario-${postId}`).value;

    fetch('api/index.php?modulo=blog&accion=crear_comentario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ post_id: postId, comentario_padre_id: padreId, contenido })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.error) {
            document.getElementById(`texto-comentario-${postId}`).value = '';
            document.getElementById(`padre-comentario-${postId}`).value = '';
            cargarComentarios(postId);
        }
    });
}

function crearPost() {
    const titulo = document.getElementById('blog-titulo').value;
    const contenido = document.getElementById('blog-contenido').value;

    fetch('api/index.php?modulo=blog&accion=crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titulo, contenido })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.mensaje || "Post publicado exitosamente.");
        if (!data.error) {
            document.getElementById('blog-titulo').value = '';
            document.getElementById('blog-contenido').value = '';
            cargarPosts();
        }
    });
}

// ==========================================
// FUNCIONES NUEVAS PARA ELIMINAR (ADMIN)
// ==========================================

function borrarPost(id) {
    if (!confirm("¿Eliminar esta publicación permanentemente?")) return;
    
    fetch('api/index.php?modulo=blog&accion=borrar_post', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include',
        body: JSON.stringify({ post_id: id })
    })
    .then(res => res.json())
    .then(data => { 
        if (!data.error) {
            cargarPosts(); 
        } else {
            alert(data.mensaje); // Si no es admin, le saltará alerta de "No autorizado"
        }
    });
}

function borrarComentario(id, postId) {
    if (!confirm("¿Eliminar este comentario?")) return;
    
    fetch('api/index.php?modulo=blog&accion=borrar_comentario', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include',
        body: JSON.stringify({ comentario_id: id })
    })
    .then(res => res.json())
    .then(data => { 
        if (!data.error) {
            cargarComentarios(postId); 
        } else {
            alert(data.mensaje);
        }
    });
}
