document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Aquí puedes poner la lógica para cerrar sesión
            // Por ejemplo, redirigir a /logout
            window.location.href = '/logout';
        });
    }
});