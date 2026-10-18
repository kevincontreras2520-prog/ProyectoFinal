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

            const strPosts = JSON.stringify(posts);
            if (strPosts === cachePosts) {
                posts.forEach(p => cargarComentarios(p.id));
                return;
            }

            cachePosts = strPosts;
            const caja = document.getElementById('blog-box');
            if (!caja) return;
            caja.innerHTML = '';

            posts.forEach(post => {
                caja.innerHTML += `
                    <div style="background:#fff; padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid #ddd;">
                        <h2 style="margin:0;">${post.titulo}</h2>
                        <p>${post.contenido}</p>
                        <small style="color:gray;">Por <b>${post.avatar || '👤'} ${post.nombre || post.autor}</b> | ${post.fecha_creacion}</small>
                        <hr style="border:0; border-top:1px solid #eee; margin:10px 0;">
                        
                        <div id="comentarios-post-${post.id}"><i>Cargando comentarios...</i></div>
                        
                        <div style="margin-top:10px; display:flex; gap:5px;">
                            <input type="text" id="texto-comentario-${post.id}" placeholder="Escribe un comentario..." style="margin:0;">
                            <input type="hidden" id="padre-comentario-${post.id}" value="">
                            <button onclick="enviarComentario(${post.id})" class="btn btn-primary">Comentar</button>
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
            const comentarios = response.comentarios || response;
            if (!Array.isArray(comentarios)) return;

            const strCom = JSON.stringify(comentarios);
            if (cacheComentarios[postId] === strCom) return;

            cacheComentarios[postId] = strCom;
            const caja = document.getElementById(`comentarios-post-${postId}`);
            if (!caja) return;
            caja.innerHTML = '';

            const principales = comentarios.filter(c => !c.comentario_padre_id);
            const respuestas = comentarios.filter(c => c.comentario_padre_id);

            principales.forEach(padre => {
                const misRespuestas = respuestas.filter(r => r.comentario_padre_id == padre.id);
                
                let htmlRespuestas = '';
                misRespuestas.forEach(hijo => {
                    htmlRespuestas += `
                        <div class="comentario-hijo">
                            <b>${hijo.avatar || '👤'} ${hijo.nombre || hijo.autor}:</b> ${hijo.contenido}
                        </div>`;
                });

                caja.innerHTML += `
                    <div class="comentario-padre">
                        <b>${padre.avatar || '👤'} ${padre.nombre || padre.autor}:</b> ${padre.contenido}
                        <a href="javascript:void(0)" style="font-size:11px; margin-left:10px;" onclick="prepararRespuesta(${postId}, ${padre.id}, '${padre.nombre || padre.autor}')">↩ Responder</a>
                        <div class="contenedor-respuestas">${htmlRespuestas}</div>
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