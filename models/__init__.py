# Importar todos los modelos para facilitar su uso
from .firma import Firma
from .cliente import Cliente
from .archivos import Archivos
from .documentos import Documentos
from .orden_st import OrdenST
from .contrato_comodato import ContratoComodato
from .contrato_garantia import ContratoGarantia
from .contrato_mandato import ContratoMandato
from .consentimiento_informado import ConsentimientoInformado
from .recibo_entrega_producto import ReciboEntregaProducto

# Lista de todos los modelos disponibles
__all__ = [
    'Firma',
    'Cliente', 
    'Archivos',
    'Documentos',
    'OrdenST',
    'ContratoComodato',
    'ContratoGarantia',
    'ContratoMandato',
    'ConsentimientoInformado',
    'ReciboEntregaProducto'
] 