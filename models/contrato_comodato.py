from extensions import db
from .documentos import Documentos

class ContratoComodato(db.Model):
    """Modelo para la tabla contrato_comodato"""
    __bind_key__ = 'db4'
    __table_args__ = {'schema': 'firmas'}
    
    id = db.Column(db.Integer, db.ForeignKey('firmas.documentos.id'), primary_key=True)
    ciudad = db.Column(db.String(50))
    dispositivo = db.Column(db.String(50))
    vigencia = db.Column(db.String(3))
    valor_dispositivo = db.Column(db.String(10))
    created_at = db.Column(db.DateTime)
    
    # Relación con Documentos
    documento = db.relationship('Documentos', backref='contrato_comodato', uselist=False)
    
    def __repr__(self):
        return f'<ContratoComodato {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'ciudad': self.ciudad,
            'dispositivo': self.dispositivo,
            'vigencia': self.vigencia,
            'valor_dispositivo': self.valor_dispositivo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'documento': self.documento.to_dict() if self.documento else None
        }