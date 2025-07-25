from flask import Blueprint, render_template, request, jsonify
import base64
import os
from datetime import datetime
from extensions import db
from apps.firmas.models.documentos import Documentos
from apps.firmas.models.contrato_comodato import ContratoComodato
from apps.firmas.models.cliente import Cliente


# Crear el blueprint
comodato_bp = Blueprint('comodato', __name__, url_prefix='/comodato')

@comodato_bp.route('/')
def comodato():
    """Mostrar formulario de contrato de comodato"""
    return render_template('comodato.html')

@comodato_bp.route('/entregaproduc')
def entregaproduct():
    """Mostrar formulario de entrega de producto"""
    return render_template('entregaproduct.html')

@comodato_bp.route('/guardar_firma', methods=['POST'])
def guardar_firma():
    """Endpoint principal para guardar contrato con firma"""
    try:
        data = request.get_json()
        print(f"DEBUG: Datos recibidos: {data}")
        
        if not data or 'contrato_data' not in data:
            return jsonify({'success': False, 'message': 'Datos incompletos'}), 400

        contrato = data['contrato_data']
        print(f"DEBUG: Datos del contrato: {contrato}")

        # Validar campos requeridos
        required_fields = ['nombreCompleto', 'cedula', 'direccion', 'telefono', 'ciudad', 'duracionDias', 'descripcionBienes', 'valorBienes']
        for field in required_fields:
            if not contrato.get(field):
                return jsonify({'success': False, 'message': f'El campo {field} es requerido'}), 400

        # Validaciones adicionales
        if contrato.get('email') and '@' not in contrato['email']:
            return jsonify({'success': False, 'message': 'Email inválido'}), 400
        
        # Validar teléfono (remover caracteres no numéricos)
        telefono_limpio = ''.join(filter(str.isdigit, str(contrato['telefono'])))
        if not telefono_limpio:
            return jsonify({'success': False, 'message': 'Teléfono debe contener números'}), 400

        # Validar tipos numéricos
        try:
            duracion_dias = int(contrato['duracionDias'])
            # Limpiar valor_bienes de formato de moneda
            valor_bienes_str = str(contrato['valorBienes']).replace(',', '').replace('.', '')
            valor_bienes = float(valor_bienes_str) if valor_bienes_str else 0.0
        except (ValueError, TypeError) as e:
            print(f"DEBUG: Error en conversión numérica: {e}")
            return jsonify({'success': False, 'message': 'Valores numéricos inválidos'}), 400

        # Procesar firma si existe (opcional, solo para logging)
        firma_procesada = False
        firma_data = data.get('firma_comodatario') or contrato.get('firmaBase64', '')
        
        if firma_data and firma_data.strip():
            try:
                print(f"DEBUG: Firma recibida (longitud: {len(firma_data)})")
                firma_procesada = True
                
                print(f"DEBUG: Firma procesada exitosamente")
                
            except Exception as firma_error:
                print(f"ERROR al procesar firma: {firma_error}")
                # No fallar por error de firma, continuar sin firma
                pass

        # 1. Crear documento primero (sin cliente)
        try:
            nuevo_documento = Documentos(
                id_cliente=contrato['cedula'],  
                url='ruta/del/documento',
                ciudad=contrato['ciudad']
            )
            db.session.add(nuevo_documento)
            db.session.flush()  # Obtener el ID del documento
            print(f"DEBUG: Documento creado con ID: {nuevo_documento.id}")
            
        except Exception as doc_error:
            print(f"ERROR al crear documento: {doc_error}")
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Error al crear documento: {str(doc_error)}'}), 500

        # 2. Verificar si el cliente ya existe o crear nuevo
        try:
            cliente_existente = Cliente.query.get(contrato['cedula'])
            if cliente_existente:
                print(f"DEBUG: Actualizando cliente existente: {contrato['cedula']}")
                # Actualizar datos del cliente existente
                cliente_existente.nombre = contrato['nombreCompleto']
                cliente_existente.direccion = contrato['direccion']
                cliente_existente.correo_electronico = contrato.get('email', '')
                cliente_existente.telefono = telefono_limpio
                cliente_existente.id_documento = nuevo_documento.id
                cliente = cliente_existente
            else:
                print(f"DEBUG: Creando nuevo cliente: {contrato['cedula']}")
                # Crear nuevo cliente
                cliente = Cliente(
                    nit=contrato['cedula'],
                    nombre=contrato['nombreCompleto'],
                    direccion=contrato['direccion'],
                    correo_electronico=contrato.get('email', ''),
                    telefono=telefono_limpio,
                    id_documento=nuevo_documento.id
                )
                db.session.add(cliente)
            
            db.session.flush()  # Asegurar que el cliente esté en la DB
            print(f"DEBUG: Cliente procesado: {cliente.nit}")
            
        except Exception as cliente_error:
            print(f"ERROR al procesar cliente: {cliente_error}")
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Error al procesar cliente: {str(cliente_error)}'}), 500

        # 3. Crear contrato de comodato
        try:
            nuevo_contrato = ContratoComodato(
                id=nuevo_documento.id,
                ciudad=contrato['ciudad'],
                dispositivo=contrato['descripcionBienes'],
                vigencia=str(duracion_dias),
                valor_dispositivo=str(valor_bienes),
                created_at=datetime.now()
            )
            db.session.add(nuevo_contrato)
            print(f"DEBUG: Contrato creado con ID: {nuevo_documento.id}")
            
        except Exception as contrato_error:
            print(f"ERROR al crear contrato: {contrato_error}")
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Error al crear contrato: {str(contrato_error)}'}), 500
        
        # Commit final
        try:
            db.session.commit()
            print("DEBUG: Transacción completada exitosamente")
        except Exception as commit_error:
            print(f"ERROR en commit: {commit_error}")
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Error al guardar en base de datos: {str(commit_error)}'}), 500

        return jsonify({
            'success': True, 
            'message': 'Contrato y cliente registrados correctamente.',
            'contrato_id': nuevo_contrato.id,
            'cliente_nit': cliente.nit,
            'firma_procesada': firma_procesada
        })

    except Exception as e:
        db.session.rollback()
        print(f"ERROR GENERAL: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Error al registrar: {str(e)}'}), 500

@comodato_bp.route('/registrar_contrato', methods=['POST'])
def registrar_contrato():
    """Endpoint para registrar contrato sin firma"""
    try:
        data = request.get_json()
        print(f"DEBUG: Datos recibidos para contrato: {data}")
        
        if not data:
            return jsonify({'success': False, 'message': 'No se recibieron datos'}), 400
        
        # Reestructurar datos para que coincidan con el formato esperado por guardar_firma
        contrato_data = {
            'contrato_data': data,
            'firma_comodatario': data.get('firmaBase64', '')  # Mantener para compatibilidad
        }
        
        # Simular request con los nuevos datos
        original_json = request._cached_json if hasattr(request, '_cached_json') else None
        request._cached_json = contrato_data
        
        try:
            result = guardar_firma()
            return result
        finally:
            # Restaurar el JSON original
            if original_json:
                request._cached_json = original_json
            elif hasattr(request, '_cached_json'):
                delattr(request, '_cached_json')
        
    except Exception as e:
        db.session.rollback()
        print(f"ERROR en registrar_contrato: {str(e)}")
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500
