from extensions import db
from .documentos import Documentos

class CartaAntifraude(db.Model):
    """Modelo para la tabla carta_antifraude"""
    __bind_key__ = 'db4'
    __table_args__ = {'schema': 'firmas'}
    
    id = db.Column(db.Integer, db.ForeignKey('firmas.documentos.id'), primary_key=True)
    ciudad = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False) 

    # Relación con Documentos
    documento = db.relationship('Documentos', backref='carta_antifraude', uselist=False)

    def __repr__(self):
        return f'<CartaAntifraude {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'ciudad': self.ciudad,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'documento': self.documento.to_dict() if self.documento else None
        }