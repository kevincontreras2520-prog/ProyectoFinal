let cachePosts = '';
let cacheComentarios = {};
let esAdminGlobal = false; // Variable global para saber si es admin

// Función para evitar inyección de código (XSS)
function escaparHTML(str) {
    return String(str || '').replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

function cargarPosts() {
    const cursor = document.activeElement;
    if (cursor && cursor.id && cursor.id.includes('comentario')) return;

    fetch('api/index.php?modulo=blog&accion=leer', { credentials: 'include' })
        .then(res => res.json())
        .then(response => {
            const posts = response.posts || response;
            if (!Array.isArray(posts)) return;

            // Guardamos si el usuario actual es admin
            esAdminGlobal = response.es_admin || false;

            const caja = document.getElementById('blog-box');
            if (!caja) return;
            caja.innerHTML = '';

            if (posts.length === 0) {
                caja.innerHTML = '<p style="text-align:center; color:gray;">No hay publicaciones aún. ¡Sé el primero en escribir!</p>';
                return;
            }

            posts.forEach(post => {
                const contenidoFormateado = escaparHTML(post.contenido).replace(/\n/g, '<br>');
                
                // Lógica del botón de borrar post
                const botonBorrarPost = esAdminGlobal ? `<button onclick="borrarPost(${post.id})" class="btn btn-danger btn-sm" style="float: right;">🗑️ Borrar Post</button>` : '';

                caja.innerHTML += `
                    <div class="tarjeta-post">
                        <div class="post-header">
                            <div class="post-avatar">${post.avatar || '👤'}</div>
                            <div class="post-info">
                                <b>${escaparHTML(post.nombre || post.autor)}</b>
                                <small>${post.fecha_creacion}</small>
                            </div>
                        </div>
                        
                        <div class="post-body">
                            <h3 class="post-titulo">${escaparHTML(post.titulo)} 
                                ${botonBorrarPost}
                            </h3>
                            <p class="post-contenido">${contenidoFormateado}</p>
                        </div>
                        
                        <div class="post-comentarios">
                            <div id="comentarios-post-${post.id}"><i style="color:gray; font-size:13px;">Cargando comentarios...</i></div>
                            
                            <div class="input-comentario">
                                <input type="text" id="texto-comentario-${post.id}" placeholder="Escribe un comentario..." maxlength="500" onkeypress="if(event.key === 'Enter') enviarComentario(${post.id})">
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

            if (comentarios.length === 0) {
                caja.innerHTML = '<i style="color:gray; font-size:13px;">Sin comentarios aún.</i>';
                return;
            }

            comentarios.forEach(com => {
                // Lógica del botón de borrar comentario
                const btnBorrarComentario = esAdminGlobal ? `<button onclick="borrarComentario(${com.id}, ${postId})" class="btn btn-danger btn-sm" style="float: right; padding: 0 5px; font-size: 10px; line-height: 1.5;">x</button>` : '';

                caja.innerHTML += `
                    <div class="comentario-padre">
                        <b>${com.avatar || '👤'} ${escaparHTML(com.nombre)}:</b> ${escaparHTML(com.contenido)}
                        ${btnBorrarComentario}
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
    const inputElement = document.getElementById(`texto-comentario-${postId}`);
    const contenido = inputElement.value.trim();
    const padreId = document.getElementById(`padre-comentario-${postId}`).value;

    if (!contenido) {
        alert("El comentario no puede estar vacío.");
        return;
    }

    const btn = inputElement.nextElementSibling;
    btn.disabled = true;
    btn.innerText = "Enviando...";

    fetch('api/index.php?modulo=blog&accion=crear_comentario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ post_id: postId, comentario_padre_id: padreId, contenido })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.error) {
            inputElement.value = '';
            document.getElementById(`padre-comentario-${postId}`).value = '';
            cargarComentarios(postId);
        } else {
            alert("Error al enviar comentario: " + (data.mensaje || "Revisa tu conexión."));
        }
    })
    .catch(err => {
        console.error(err);
        alert("Error de conexión con el servidor.");
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerText = "Comentar";
    });
}

function crearPost() {
    const titulo = document.getElementById('blog-titulo').value;
    const contenido = document.getElementById('blog-contenido').value;

    if (!titulo || !contenido) {
        alert("Por favor, llena el título y el contenido.");
        return;
    }

    fetch('api/index.php?modulo=blog&accion=crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titulo, contenido })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.error) {
            document.getElementById('blog-titulo').value = '';
            document.getElementById('blog-contenido').value = '';
            cargarPosts();
        } else {
            alert(data.mensaje || "Error al publicar.");
        }
    });
}

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
            alert(data.mensaje);
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
