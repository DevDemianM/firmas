from extensions import db
from .documentos import Documentos

class ContratoMandato(db.Model):
    """Modelo para la tabla contrato_mandato"""
    __bind_key__ = 'db4'
    __table_args__ = {'schema': 'firmas'}
    
    id = db.Column(db.Integer, db.ForeignKey('firmas.documentos.id'), primary_key=True)
    dispositivo = db.Column(db.String(50), nullable=False)
    marca = db.Column(db.String(20), nullable=False)
    imei = db.Column(db.String(20), nullable=False)
    ciudad = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime)
    
    # Relación con Documentos
    documento = db.relationship('Documentos', backref='contrato_mandato', uselist=False)
    
    def __repr__(self):
        return f'<ContratoMandato {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'dispositivo': self.dispositivo,
            'marca': self.marca,
            'imei': self.imei,
            'ciudad': self.ciudad,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'documento': self.documento.to_dict() if self.documento else None
        }   