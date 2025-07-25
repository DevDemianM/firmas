from flask import Blueprint, session, redirect, url_for, flash

firmas = Blueprint('firmas', __name__, template_folder='templates', static_folder='static')

@firmas.before_request
def check_firmas_access():
    user_roles = session.get('user_roles', [])
    if ('Admin' not in user_roles):
        flash('Acceso denegado. Se requiere ser administrador.', 'danger')
        return redirect(url_for('home'))
    
from apps.firmas.routes.firmas import firmas_bp
from apps.firmas.routes.plantillas import plantillas_bp
from apps.firmas.routes.plantillas.ordenST import plantillas_ordenST_bp
from apps.firmas.routes.plantillas import comodato_bp
from apps.firmas.routes.cargas import cargas_bp
from apps.firmas.routes.busquedas import busquedas_bp
from apps.firmas.routes.plantillas.mandato import mandato_bp

# Registrar los blueprints secundarios en el blueprint principal
firmas.register_blueprint(firmas_bp)
firmas.register_blueprint(plantillas_bp)
firmas.register_blueprint(plantillas_ordenST_bp)
firmas.register_blueprint(comodato_bp)
firmas.register_blueprint(cargas_bp)
firmas.register_blueprint(busquedas_bp)
firmas.register_blueprint(mandato_bp)
