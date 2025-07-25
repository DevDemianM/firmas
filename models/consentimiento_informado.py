from extensions import db
from .documentos import Documentos

class ConsentimientoInformado(db.Model):
    """Modelo para la tabla consentimiento_informado"""
    __bind_key__ = 'db4'
    __table_args__ = {'schema': 'firmas'}
    
    id = db.Column(db.Integer, db.ForeignKey('firmas.documentos.id'), primary_key=True)
    dispositivo = db.Column(db.String(50), nullable=False)
    acepto = db.Column(db.Boolean, nullable=False)
    aplica_referencia = db.Column(db.String(50))
    sede = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, nullable=False)
    
    # Relación con Documentos
    documento = db.relationship('Documentos', backref='consentimiento_informado', uselist=False)
    
    def __repr__(self):
        return f'<ConsentimientoInformado {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'dispositivo': self.dispositivo,
            'acepto': self.acepto,
            'aplica_referencia': self.aplica_referencia,
            'sede': self.sede,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'documento': self.documento.to_dict() if self.documento else None
        }