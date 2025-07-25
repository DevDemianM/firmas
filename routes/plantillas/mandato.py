from flask import Blueprint, render_template, request, jsonify

import base64

mandato_bp = Blueprint('mandato', __name__, url_prefix='/mandato')

@mandato_bp.route('/')
def mandato():
    """Mostrar formulario de contrato de mandato"""
    return render_template('mandato.html')