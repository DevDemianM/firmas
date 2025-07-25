from extensions import db
from .documentos import Documentos

class ReciboEntregaProducto(db.Model):
    """Modelo para la tabla recibo_entrega_producto"""
    __bind_key__ = 'db4'
    __table_args__ = {'schema': 'firmas'}
    
    id = db.Column(db.Integer, db.ForeignKey('firmas.documentos.id'), primary_key=True)
    dispositivo = db.Column(db.String(50), nullable=False)
    numero_aprobacion = db.Column(db.String(50))
    comprador = db.Column(db.String(50))
    vendedor = db.Column(db.String(50))
    sede = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, nullable=False)
    
    # Relación con Documentos
    documento = db.relationship('Documentos', backref='recibo_entrega_producto', uselist=False)
    
    def __repr__(self):
        return f'<ReciboEntregaProducto {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'dispositivo': self.dispositivo,
            'numero_aprobacion': self.numero_aprobacion,
            'comprador': self.comprador,
            'vendedor': self.vendedor,
            'sede': self.sede,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'documento': self.documento.to_dict() if self.documento else None
        } 