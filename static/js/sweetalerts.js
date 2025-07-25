/**
 * Utilidades para SweetAlert2
 * Funciones para mostrar mensajes de alerta en la aplicación
 */

// Alerta de éxito
function showSuccessAlert(title, message, callback = null) {
    Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        confirmButtonColor: '#1976d2',
        confirmButtonText: 'Aceptar',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-confirm'
        }
    }).then((result) => {
        if (result.isConfirmed && callback) {
            callback();
        }
    });
}

// Alerta de error
function showErrorAlert(title, message) {
    Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Entendido',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-confirm'
        }
    });
}

// Alerta de advertencia
function showWarningAlert(title, message) {
    Swal.fire({
        icon: 'warning',
        title: title,
        text: message,
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'Entendido',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-confirm'
        }
    });
}

// Alerta de información
function showInfoAlert(title, message) {
    Swal.fire({
        icon: 'info',
        title: title,
        text: message,
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Entendido',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-confirm'
        }
    });
}

// Alerta de confirmación
function showConfirmAlert(title, message, confirmCallback, cancelCallback = null) {
    Swal.fire({
        icon: 'question',
        title: title,
        text: message,
        showCancelButton: true,
        confirmButtonColor: '#1976d2',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-confirm',
            cancelButton: 'swal-custom-cancel'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            if (confirmCallback) confirmCallback();
        } else if (cancelCallback) {
            cancelCallback();
        }
    });
}

// Alerta de carga
function showLoadingAlert(title = 'Procesando', message = 'Por favor espere...') {
    Swal.fire({
        title: title,
        text: message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title'
        }
    });
}

// Cerrar alerta de carga
function closeLoadingAlert() {
    Swal.close();
}

// Toast (mensaje pequeño)
function showToast(message, type = 'success') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: type,
        title: message
    });
} 