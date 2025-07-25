from flask import Blueprint, render_template, request, redirect, url_for, flash
from apps.firmas.models.cliente import Cliente, db as db_cliente
from apps.firmas.models.orden_st import OrdenST, db as db_ordenst

plantillas_bp = Blueprint('plantillas', __name__, url_prefix='/plantillas')

@plantillas_bp.route('/')
def plantilla():
    return render_template('plantilla.html')





