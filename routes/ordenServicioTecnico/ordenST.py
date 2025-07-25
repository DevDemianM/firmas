from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from apps.firmas.models.cliente import Cliente
from apps.firmas.models.orden_st import OrdenST
from apps.firmas.models.documentos import Documentos
from apps.firmas.models.firma import Firma
from apps.firmas.models.archivos import Archivos
from extensions import db
from datetime import datetime

ordenST_bp = Blueprint('ordenST', __name__, url_prefix='/ordenST')

@ordenST_bp.route('/', methods=['GET', 'POST'])
def ordenST():
    if request.method == 'POST':
        try:
            # Datos del formulario
            responsable = request.form.get('responsable')
            sede = request.form.get('sede')
            documento_identidad = request.form.get('documento_identidad')
            tipo_documento = request.form.get('tipo_documento')
            nombre_cliente = request.form.get('nombre')
            telefono = request.form.get('telefono')
            correo_electronico = request.form.get('correo_electronico')
            direccion = request.form.get('direccion')
            marca = request.form.get('marca')
            dispositivo = request.form.get('dispositivo')
            imei = request.form.get('imei')
            prende = request.form.get('prende') == 'true'
            bateria = request.form.get('bateria') == 'true'
            porcentaje_bateria = int(request.form.get('porcentaje_bateria')) if request.form.get('porcentaje_bateria') else None
            codigo_seguridad = request.form.get('codigo_seguridad')
            correo_vinculado = request.form.get('correo_vinculado')
            patron = request.form.get('patron')
            contrasena = request.form.get('contraseña')
            firma_imagen = request.form.get('firma_imagen')  # Nueva línea para recibir la firma


            # 1. Crear registro de Firma (información de la sesión)
            nueva_firma = Firma(
                user_agent=request.headers.get('User-Agent', ''),
                ip=request.remote_addr or '127.0.0.1',
                created_at=datetime.now(),
                firma_imagen=firma_imagen
            )
            db.session.add(nueva_firma)
            db.session.flush()  # Para obtener el ID

            # 2. Crear o actualizar Cliente
            # Usar documento de identidad como NIT
            cliente_existente = Cliente.query.filter_by(nit=documento_identidad).first()
            
            if cliente_existente:
                # Actualizar cliente existente
                cliente_existente.nombre = nombre_cliente
                cliente_existente.tipo_documento = tipo_documento
                cliente_existente.direccion = direccion
                cliente_existente.correo_electronico = correo_electronico
                cliente_existente.telefono = telefono
                cliente_existente.id_firma = nueva_firma.id
                cliente = cliente_existente
            else:
                # Crear nuevo cliente
                nuevo_cliente = Cliente(
                    nit=documento_identidad,
                    nombre=nombre_cliente,
                    tipo_documento=tipo_documento,
                    direccion=direccion,
                    correo_electronico=correo_electronico,
                    telefono=telefono,
                    id_documento=0,  # Valor por defecto
                    huella=None,
                    id_firma=nueva_firma.id
                )
                db.session.add(nuevo_cliente)
                cliente = nuevo_cliente

            db.session.flush()  # Para asegurar que el cliente existe

            # 3. Crear registro en Documentos
            nuevo_documento = Documentos(
                id_cliente=cliente.nit,
                tipo_documento='Orden de Servicio Técnico',
                url=f'/firmas/ordenST/{nueva_firma.id}',
                ciudad=sede,
                id_firma=nueva_firma.id
            )
            db.session.add(nuevo_documento)
            db.session.flush()  # Para obtener el ID

            # 4. Crear registro en OrdenST
            nueva_orden = OrdenST(
                id=nuevo_documento.id,
                responsable=responsable,
                sede=sede,
                marca=marca,
                dispositivo=dispositivo,
                imei=imei,
                estado_equipo=None,
                problema=None,
                prende=prende,
                bateria=bateria,
                porcentaje_bateria=porcentaje_bateria,
                codigo_seguridad=codigo_seguridad,
                correo_vinculado=correo_vinculado,
                patron=patron,
                contraseña=contrasena,
                diagnostico=None,
                valor_reparacion=None
            )
            db.session.add(nueva_orden)

            # Confirmar todos los cambios en una sola transacción
            db.session.commit()

            flash('Orden de Servicio Técnico firmada y guardada exitosamente.', 'success')
            
            # Redirigir a la vista de la plantilla con el ID del documento
            return redirect(url_for('ordenST.ver_plantilla_orden', documento_id=nuevo_documento.id))

        except Exception as e:
            # Rollback de la transacción
            db.session.rollback()
            flash(f'Error al guardar la orden: {str(e)}', 'danger')
            
            # Crear datos vacíos para mostrar la plantilla
            orden_data = {
                'responsable': responsable if 'responsable' in locals() else '',
                'sede': sede if 'sede' in locals() else '',
                'marca': marca if 'marca' in locals() else '',
                'dispositivo': dispositivo if 'dispositivo' in locals() else '',
                'imei': imei if 'imei' in locals() else '',
                'problema': '',
                'prende': prende if 'prende' in locals() else False,
                'bateria': bateria if 'bateria' in locals() else False,
                'porcentaje_bateria': porcentaje_bateria if 'porcentaje_bateria' in locals() else None,
                'diagnostico': '',
                'valor_reparacion': '',
                'codigo_seguridad': codigo_seguridad if 'codigo_seguridad' in locals() else '',
                'correo_vinculado': correo_vinculado if 'correo_vinculado' in locals() else '',
                'patron': patron if 'patron' in locals() else '',
                'contraseña': contrasena if 'contrasena' in locals() else ''
            }
            
            # Datos del cliente para la plantilla
            cliente_data = {
                'nombre': nombre_cliente if 'nombre_cliente' in locals() else '',
                'tipo_documento': tipo_documento if 'tipo_documento' in locals() else '',
                'nit': documento_identidad if 'documento_identidad' in locals() else '',
                'correo_electronico': correo_electronico if 'correo_electronico' in locals() else '',
                'telefono': telefono if 'telefono' in locals() else ''
            }
            
            return render_template('plantillaOrdenST.html', 
                                 orden=orden_data,
                                 cliente=cliente_data,
                                 documento=None,
                                 firma=None,
                                 fotos=[],
                                 numero_orden='XXXX')
    
    # Para solicitudes GET, mostrar la plantilla con datos vacíos
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
    
    cliente_data = {
        'nombre': '',
        'tipo_documento': '',
        'nit': '',
        'correo_electronico': '',
        'telefono': ''
    }
    
    return render_template('plantillaOrdenST.html', 
                         orden=orden_data,
                         cliente=cliente_data,
                         documento=None,
                         firma=None,
                         fotos=[],
                         numero_orden='XXXX')

@ordenST_bp.route('/plantilla/<int:documento_id>')
def ver_plantilla_orden(documento_id):
    """Vista para mostrar la plantilla de orden de servicio técnico con todos los datos"""
    try:
        # Obtener el documento con sus relaciones
        documento = Documentos.query.get_or_404(documento_id)
        
        # Obtener la orden ST relacionada
        orden = OrdenST.query.filter_by(id=documento_id).first()
        if not orden:
            flash('No se encontró la orden de servicio técnico.', 'error')
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
        
        # Obtener el cliente y firma
        cliente = Cliente.query.filter_by(nit=documento.id_cliente).first()
        firma = Firma.query.get(documento.id_firma)
        
        # Obtener las fotos del equipo (archivos relacionados con el cliente)
        fotos = Archivos.query.filter_by(nit=documento.id_cliente).all()
        
        # Generar número de orden (usar el ID del documento)
        numero_orden = str(documento.id).zfill(4)
        
        return render_template('plantillaOrdenST.html', 
                             orden=orden,
                             documento=documento,
                             cliente=cliente,
                             firma=firma,
                             fotos=fotos,
                             numero_orden=numero_orden)
        
    except Exception as e:
        flash(f'Error al cargar la plantilla: {str(e)}', 'error')
        # Devolver una respuesta JSON si es una solicitud AJAX
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': False,
                'message': f'Error al cargar la plantilla: {str(e)}'
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

@ordenST_bp.route('/subir-nube/<int:documento_id>', methods=['POST'])
def subir_documento_nube(documento_id):
    """Subir documento de orden de servicio técnico a la nube"""
    try:
        # Obtener datos del request
        data = request.get_json()
        numero_orden = data.get('numero_orden', str(documento_id).zfill(4))
        
        # Obtener el documento y validar que existe
        documento = Documentos.query.get_or_404(documento_id)
        orden = OrdenST.query.filter_by(id=documento_id).first()
        
        if not orden:
            return jsonify({
                'success': False,
                'message': 'No se encontró la orden de servicio técnico'
            }), 404
        
        # Aquí puedes implementar la lógica específica para subir a tu servicio de nube
        # Por ejemplo: Google Drive, AWS S3, Azure Blob Storage, etc.
        
        # Simular el proceso de subida (reemplaza con tu implementación real)
        import time
        time.sleep(2)  # Simular tiempo de procesamiento
        
        # Ejemplo de URL donde se subió el archivo (reemplaza con tu implementación)
        cloud_url = f"https://tu-servicio-nube.com/documentos/orden_st_{numero_orden}.pdf"
        
        # Opcional: Actualizar la URL del documento en la base de datos
        documento.url = cloud_url
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Documento subido correctamente a la nube',
            'cloud_url': cloud_url
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al subir el documento: {str(e)}'
        }), 500