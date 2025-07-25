from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from datetime import datetime
import os
import json
from werkzeug.utils import secure_filename
from apps.firmas.models.orden_st import OrdenST
from extensions import db
from apps.firmas.models.cliente import Cliente
from apps.firmas.models.firma import Firma
from apps.firmas.models.archivos import Archivos

plantillas_ordenST_bp = Blueprint('plantillas_ordenST', __name__, url_prefix='/plantillas/ordenST')

@plantillas_ordenST_bp.route('/', methods=['GET'])
def index():
    """Página principal de órdenes de servicio técnico"""
    # Crear datos vacíos para mostrar la plantilla
    orden_data = {
        'responsable': '',
        'sede': '',
        'marca': '',
        'dispositivo': '',
        'imei': '',
        'problema': '',
        'prende': False,
        'bateria': False,
        'porcentaje_bateria': None,
        'diagnostico': '',
        'valor_reparacion': '',
        'codigo_seguridad': '',
        'correo_vinculado': '',
        'patron': '',
        'contraseña': '',
        'estado_equipo': ''
    }
    
    # Añadir fecha actual para el pie de página
    from datetime import datetime
    now = datetime.now()
    
    return render_template('plantillaOrdenST.html', 
                         orden=orden_data,
                         cliente=None,
                         documento=None,
                         firma=None,
                         fotos=[],
                         now=now,
                         numero_orden='XXXX')

@plantillas_ordenST_bp.route('/crear', methods=['POST'])
def crear_orden():
    """Crear una nueva orden de servicio técnico"""
    try:
        # Obtener datos del formulario
        data = request.form.to_dict()
        
        # Crear nueva orden
        nueva_orden = OrdenST(
            responsable=data.get('responsable', ''),
            sede=data.get('sede', ''),
            marca=data.get('marca', ''),
            dispositivo=data.get('dispositivo', ''),
            imei=data.get('imei', ''),
            estado_equipo=data.get('estado_equipo'),
            problema=data.get('problema'),
            prende=bool(int(data.get('prende', '0'))),
            bateria=bool(int(data.get('bateria', '0'))),
            porcentaje_bateria=int(data.get('porcentaje_bateria', 0)) if data.get('porcentaje_bateria') else None,
            codigo_seguridad=data.get('codigo_seguridad'),
            correo_vinculado=data.get('correo_vinculado'),
            patron=data.get('patron'),
            contraseña=data.get('contraseña'),
            diagnostico=data.get('diagnostico'),
            valor_reparacion=float(data.get('valor_reparacion', 0)) if data.get('valor_reparacion') else None
        )
        
        # Guardar en la base de datos
        db.session.add(nueva_orden)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Orden de servicio técnico creada correctamente',
            'orden_id': nueva_orden.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error al crear la orden: {str(e)}'
        }), 500

@plantillas_ordenST_bp.route('/st', methods=['POST'])
def recibir_ticket_st():
    """Endpoint para recibir datos de tickets ST y guardarlos en la base de datos"""
    try:
        # Obtener datos del formulario
        data = request.form.to_dict()
        
        # Mapear campos del formulario de tickets a los campos de OrdenST
        nueva_orden = OrdenST(
            responsable=data.get('technical_name', ''),
            sede=data.get('origen', 'ST'),
            marca=data.get('reference', '').split(' ')[0] if data.get('reference') else '',
            dispositivo=data.get('reference', ''),
            imei=data.get('IMEI', ''),
            estado_equipo=data.get('estado_equipo'),
            problema=', '.join([p for p in request.form.getlist('device_problems[]')]) if 'device_problems[]' in request.form else '',
            prende=bool(int(data.get('prende', '0'))),
            bateria=bool(int(data.get('bateria', '0'))),
            porcentaje_bateria=int(data.get('porcentaje_bateria', 0)) if data.get('porcentaje_bateria') else None,
            codigo_seguridad=data.get('codigo_seguridad'),
            correo_vinculado=data.get('correo_vinculado'),
            patron=data.get('patron'),
            contraseña=data.get('contraseña'),
            diagnostico=data.get('comment', ''),
            valor_reparacion=float(data.get('service_value', 0)) if data.get('service_value') else None
        )
        
        # Guardar en la base de datos
        db.session.add(nueva_orden)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Orden de servicio técnico creada desde tickets',
            'orden_id': nueva_orden.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error al crear la orden desde tickets: {str(e)}'
        }), 500

@plantillas_ordenST_bp.route('/st/plantilla', methods=['POST'])
def generar_plantilla_st_post():
    """Endpoint para generar la plantilla de orden ST sin guardar en la base de datos"""
    try:
        # Obtener datos del formulario
        data = request.form.to_dict()
        
        # Guardar datos del cliente en la sesión
        session['cliente_data'] = {
            'nombre': data.get('name', ''),
            'nit': data.get('document', ''),
            'tipo_documento': data.get('document_type', 'CC'),
            'direccion': data.get('address', ''),
            'correo_electronico': data.get('mail', ''),
            'telefono': data.get('phone', '')
        }
        
        # Guardar datos en sesión para mostrarlos en la plantilla
        session['orden_st_data'] = {
            'responsable': data.get('technical_name', ''),
            'sede': data.get('origen', 'ST'),
            'marca': data.get('reference', '').split(' ')[0] if data.get('reference') else '',
            'dispositivo': data.get('reference', ''),
            'imei': data.get('IMEI', ''),
            'problema': ', '.join([p for p in request.form.getlist('device_problems[]')]) if 'device_problems[]' in request.form else '',
            'prende': bool(int(data.get('prende', '0'))),
            'bateria': bool(int(data.get('bateria', '0'))),
            'porcentaje_bateria': data.get('porcentaje_bateria'),
            'diagnostico': data.get('comment', ''),
            'valor_reparacion': data.get('service_value', '0'),
            'fecha_creacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'origen': 'ST',
            'ticket_id': data.get('ticket_id'),
            'codigo_seguridad': data.get('codigo_seguridad', ''),
            'correo_vinculado': data.get('correo_vinculado', ''),
            'patron': data.get('patron', ''),
            'contraseña': data.get('contraseña', ''),
            'estado_equipo': data.get('estado_equipo', 'Normal')
        }
        
        # Guardar la firma en la sesión si existe
        if data.get('signature_data'):
            session['orden_st_firma'] = data.get('signature_data')
        
        # Guardar imágenes si existen
        if data.get('images_data'):
            try:
                images_data = json.loads(data.get('images_data'))
                session['orden_st_images'] = images_data
            except Exception as e:
                print(f"Error al procesar imágenes: {str(e)}")
                session['orden_st_images'] = []
        else:
            session['orden_st_images'] = []
        
        # Devolver una respuesta JSON con redirección directa a plantillaOrdenST.html
        return jsonify({
            'success': True,
            'message': 'Datos de plantilla procesados correctamente',
            'redirect': '/firmas/plantillas/ordenST/plantilla'
        }), 200
        
    except Exception as e:
        print(f"Error en generar_plantilla_st_post: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error al procesar datos para la plantilla: {str(e)}'
        }), 500

@plantillas_ordenST_bp.route('/generar_plantilla_st', methods=['GET'])
def generar_plantilla_st():
    """Endpoint para generar la plantilla de orden ST con datos del ticket desde sesión"""
    try:
        # Obtener datos del ticket desde la sesión
        ticket_data = session.get('ticket_data', {})
        
        if not ticket_data:
            # Si no hay datos en sesión, mostrar plantilla vacía
            return redirect(url_for('firmas.plantillas_ordenST.index'))
        
        # Importar modelos necesarios
        from apps.firmas.models.documentos import Documentos
        from apps.firmas.models.cliente import Cliente
        from apps.firmas.models.orden_st import OrdenST
        
        # Crear o buscar cliente
        cliente_data = {
            'nombre': ticket_data.get('name', ''),
            'nit': ticket_data.get('document', ''),
            'tipo_documento': ticket_data.get('document_type', 'CC'),
            'direccion': ticket_data.get('address', ''),
            'correo_electronico': ticket_data.get('mail', ''),
            'telefono': ticket_data.get('phone', '')
        }
        
        # Buscar cliente existente o crear uno nuevo
        cliente = Cliente.query.filter_by(nit=cliente_data['nit']).first()
        if not cliente:
            cliente = Cliente(
                nombre=cliente_data['nombre'],
                nit=cliente_data['nit'],
                tipo_documento=cliente_data['tipo_documento'],
                direccion=cliente_data['direccion'],
                correo_electronico=cliente_data['correo_electronico'],
                telefono=cliente_data['telefono']
            )
            db.session.add(cliente)
            db.session.flush()  # Para obtener el ID
        
        # Crear documento
        nuevo_documento = Documentos(
            id_cliente=cliente.nit,
            ruta_plantilla='plantillaOrdenST.html',
            tipo_documento='orden_st',
            estado='borrador'
        )
        db.session.add(nuevo_documento)
        db.session.flush()  # Para obtener el ID
        
        # Crear orden ST
        nueva_orden = OrdenST(
            id=nuevo_documento.id,
            responsable=ticket_data.get('technical_name', ''),
            sede=ticket_data.get('origen', ''),
            marca=ticket_data.get('reference', '').split(' ')[0] if ticket_data.get('reference') else '',
            dispositivo=ticket_data.get('reference', ''),
            imei=ticket_data.get('IMEI', ''),
            problema=', '.join(ticket_data.get('device_problems', [])),
            prende=ticket_data.get('prende', False),
            bateria=ticket_data.get('bateria', False),
            porcentaje_bateria=ticket_data.get('porcentaje_bateria'),
            diagnostico=ticket_data.get('comment', ''),
            valor_reparacion=float(ticket_data.get('service_value', 0)) if ticket_data.get('service_value') else None,
            origen='ST',
            codigo_seguridad=ticket_data.get('codigo_seguridad', ''),
            correo_vinculado=ticket_data.get('correo_vinculado', ''),
            patron=ticket_data.get('patron', ''),
            contraseña=ticket_data.get('contraseña', ''),
            estado_equipo=ticket_data.get('estado_equipo', 'Normal')
        )
        db.session.add(nueva_orden)
        db.session.commit()
        
        # Cargar imágenes del ticket si existe ticket_id
        images_data = []
        if ticket_data.get('ticket_id'):
            try:
                from apps.tickets.routes.onedrive import get_ticket_images
                ticket_images = get_ticket_images(ticket_data['ticket_id']) or []
                
                for img in ticket_images:
                    if isinstance(img, dict) and 'download_url' in img:
                        images_data.append({
                            'url': img['download_url'],
                            'name': img.get('name', f'imagen_{len(images_data) + 1}'),
                            'id': img.get('id', '')
                        })
            except Exception as e:
                print(f"Error cargando imágenes del ticket: {str(e)}")
        
        # Guardar en sesión para la plantilla
        session['orden_st_data'] = nueva_orden.to_dict()
        session['cliente_data'] = cliente_data
        session['orden_st_images'] = images_data
        session['documento_id'] = nuevo_documento.id
        
        # Limpiar datos del ticket de la sesión
        session.pop('ticket_data', None)
        
        # Redirigir a la plantilla
        return redirect(url_for('firmas.plantillas_ordenST.plantilla'))
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en generar_plantilla_st: {str(e)}")
        return redirect(url_for('firmas.plantillas_ordenST.index'))

@plantillas_ordenST_bp.route('/cargar_imagenes_ticket/<int:ticket_id>', methods=['GET'])
def cargar_imagenes_ticket(ticket_id):
    """Endpoint para cargar imágenes del ticket desde el módulo de tickets"""
    try:
        # Importar función para obtener imágenes del ticket
        from apps.tickets.routes.onedrive import get_ticket_images
        
        # Obtener imágenes del ticket
        ticket_images = get_ticket_images(ticket_id) or []
        
        # Procesar imágenes para la plantilla
        images_data = []
        for img in ticket_images:
            if isinstance(img, dict) and 'download_url' in img:
                images_data.append({
                    'url': img['download_url'],
                    'name': img.get('name', f'imagen_{len(images_data) + 1}'),
                    'id': img.get('id', '')
                })
        
        return jsonify({
            'success': True,
            'images': images_data,
            'total': len(images_data)
        })
        
    except Exception as e:
        print(f"Error cargando imágenes del ticket {ticket_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error cargando imágenes: {str(e)}',
            'images': []
        })

@plantillas_ordenST_bp.route('/plantilla', methods=['GET'])
def plantilla():
    """Muestra la plantilla de orden ST con los datos de la sesión"""
    # Obtener datos de la sesión
    orden_data = session.get('orden_st_data', {})
    orden_images = session.get('orden_st_images', [])
    cliente_data = session.get('cliente_data', {})
    
    # Si no hay datos en la sesión, crear datos vacíos para evitar errores
    if not orden_data:
        orden_data = {
            'responsable': '',
            'sede': '',
            'marca': '',
            'dispositivo': '',
            'imei': '',
            'problema': '',
            'prende': False,
            'bateria': False,
            'porcentaje_bateria': None,
            'diagnostico': '',
            'valor_reparacion': '0',
            'fecha_creacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'origen': 'ST',
            'ticket_id': '',
            'codigo_seguridad': '',
            'correo_vinculado': '',
            'patron': '',
            'contraseña': '',
            'estado_equipo': ''
        }
    
    # Obtener la firma si existe en la sesión
    firma_base64 = session.get('orden_st_firma', None)
    if firma_base64:
        orden_data['firma_base64'] = firma_base64
    
    # Añadir fecha actual para el pie de página
    now = datetime.now()
    
    # Crear objeto cliente para la plantilla
    cliente = None
    if cliente_data:
        # Crear un objeto similar a la clase Cliente para la plantilla
        class ClienteObj:
            def __init__(self, data):
                self.nombre = data.get('nombre', '')
                self.nit = data.get('nit', '')
                self.tipo_documento = data.get('tipo_documento', '')
                self.direccion = data.get('direccion', '')
                self.correo_electronico = data.get('correo_electronico', '')
                self.telefono = data.get('telefono', '')
                # Crear objeto firma para el cliente
                self.firma = type('FirmaObj', (), {'firma_imagen': firma_base64}) if firma_base64 else None
        
        cliente = ClienteObj(cliente_data)
    
    # Obtener el ID del documento para el número de orden
    documento_id = session.get('documento_id', None)
    numero_orden = str(documento_id).zfill(4) if documento_id else 'XXXX'
    
    # Siempre renderizar plantillaOrdenST.html
    return render_template('plantillaOrdenST.html', 
                         orden=orden_data, 
                         images=orden_images, 
                         now=now,
                         cliente=cliente,
                         firma=None,
                         documento=None,
                         fotos=[],
                         numero_orden=numero_orden)

@plantillas_ordenST_bp.route('/listar_ordenes', methods=['GET'])
def listar_ordenes():
    """Lista todas las órdenes de servicio técnico"""
    try:
        # Consulta directa a la base de datos
        ordenes = OrdenST.query.order_by(OrdenST.id.desc()).all()
        
        # Convertir a diccionario
        ordenes_dict = []
        for orden in ordenes:
            try:
                orden_dict = {
                    'id': orden.id,
                    'responsable': orden.responsable,
                    'sede': orden.sede,
                    'marca': orden.marca,
                    'dispositivo': orden.dispositivo,
                    'imei': orden.imei,
                    'problema': orden.problema,
                    'diagnostico': orden.diagnostico,
                    'fecha_creacion': orden.documento.created_at if orden.documento else None
                }
                ordenes_dict.append(orden_dict)
            except Exception as e:
                print(f"Error al procesar orden {orden.id}: {str(e)}")
                continue
        
        # Verificar si existe el template lista_ordenST.html
        try:
            return render_template('lista_ordenST.html', ordenes=ordenes_dict)
        except Exception as template_error:
            print(f"Error de template: {str(template_error)}")
            # Si es una solicitud AJAX, devolver un error JSON
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'success': False,
                    'message': f'Error al listar órdenes: {str(template_error)}'
                }), 500
            # Si es una solicitud normal, redirigir a la página de creación
            return render_template('plantillaOrdenST.html')
        
    except Exception as e:
        print(f"Error general en listar_ordenes: {str(e)}")
        # Si es una solicitud AJAX, devolver un error JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': False,
                'message': f'Error al listar órdenes: {str(e)}'
            }), 500
        # Si es una solicitud normal, redirigir a la página de creación
        return render_template('ordenST.html')

@plantillas_ordenST_bp.route('/ver/<int:orden_id>', methods=['GET'])
def ver_orden(orden_id):
    """Muestra los detalles de una orden específica"""
    try:
        # Obtener la orden
        orden = OrdenST.query.get(orden_id)
        
        if not orden:
            # Crear datos vacíos para mostrar la plantilla
            orden_data = {
                'responsable': '',
                'sede': '',
                'marca': '',
                'dispositivo': '',
                'imei': '',
                'problema': '',
                'prende': False,
                'bateria': False,
                'porcentaje_bateria': None,
                'diagnostico': '',
                'valor_reparacion': '',
                'codigo_seguridad': '',
                'correo_vinculado': '',
                'patron': '',
                'contraseña': ''
            }
            
            return render_template('plantillaOrdenST.html', 
                                 orden=orden_data,
                                 cliente=None,
                                 documento=None,
                                 firma=None,
                                 fotos=[],
                                 numero_orden='XXXX')
        
        # Convertir a diccionario
        orden_dict = orden.to_dict()
        
        # Obtener documento y cliente si existen
        documento = None
        cliente = None
        firma = None
        fotos = []
        
        try:
            # Intentar obtener documento relacionado
            documento = orden.documento
            if documento:
                cliente = Cliente.query.filter_by(nit=documento.id_cliente).first()
                firma = Firma.query.get(documento.id_firma)
                if cliente:
                    fotos = Archivos.query.filter_by(nit=cliente.nit).all()
        except Exception as e:
            print(f"Error al obtener relaciones: {str(e)}")
        
        # Generar número de orden
        numero_orden = str(orden_id).zfill(4)
        
        return render_template('plantillaOrdenST.html', 
                             orden=orden_dict,
                             documento=documento,
                             cliente=cliente,
                             firma=firma,
                             fotos=fotos,
                             numero_orden=numero_orden)
    except Exception as e:
        # Si es una solicitud AJAX, devolver un error JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': False,
                'message': f'Error al ver orden: {str(e)}'
            }), 500
        
        # Crear datos vacíos para mostrar la plantilla
        orden_data = {
            'responsable': '',
            'sede': '',
            'marca': '',
            'dispositivo': '',
            'imei': '',
            'problema': '',
            'prende': False,
            'bateria': False,
            'porcentaje_bateria': None,
            'diagnostico': '',
            'valor_reparacion': '',
            'codigo_seguridad': '',
            'correo_vinculado': '',
            'patron': '',
            'contraseña': ''
        }
        
        return render_template('plantillaOrdenST.html', 
                             orden=orden_data,
                             cliente=None,
                             documento=None,
                             firma=None,
                             fotos=[],
                             numero_orden='XXXX')

@plantillas_ordenST_bp.route('/subir_nube_ticket', methods=['POST'])
def subir_nube_ticket():
    """Subir documento de orden de servicio técnico a la nube usando datos de sesión"""
    try:
        # Obtener datos del request
        data = request.get_json()
        
        # Obtener datos de la sesión
        orden_data = session.get('orden_st_data', {})
        ticket_id = orden_data.get('ticket_id')
        
        if not ticket_id:
            return jsonify({
                'success': False,
                'message': 'No se encontró el ID del ticket en la sesión'
            }), 400
        
        # Número de orden para el archivo
        numero_orden = str(ticket_id).zfill(4)
        
        # Simular el proceso de subida (puedes implementar tu lógica específica aquí)
        import time
        time.sleep(2)  # Simular tiempo de procesamiento
        
        # Ejemplo de URL donde se subió el archivo (reemplaza con tu implementación real)
        cloud_url = f"https://tu-servicio-nube.com/documentos/orden_st_ticket_{numero_orden}.pdf"
        
        # Aquí podrías guardar la URL en la base de datos si es necesario
        # Por ejemplo, actualizar el registro del ticket con la URL del documento
        
        return jsonify({
            'success': True,
            'message': 'Documento subido correctamente a la nube',
            'cloud_url': cloud_url,
            'ticket_id': ticket_id
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al subir el documento: {str(e)}'
        }), 500