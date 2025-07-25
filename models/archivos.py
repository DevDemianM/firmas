from extensions import db
from .cliente import Cliente

from extensions import db

class Archivos(db.Model):
    """Modelo para la tabla archivos"""
    __bind_key__ = 'db4'
    __table_args__ = {'schema': 'firmas'}
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nit = db.Column(db.String(20), nullable=True)  # Ya no es ForeignKey
    url = db.Column(db.String(500), nullable=False)
    tipo = db.Column(db.String(50), nullable=True)  # Para identificar el tipo de archivo (foto_equipo, firma, etc.)
    
    def __repr__(self):
        return f'<Archivos {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nit': self.nit,
            'url': self.url,
            'tipo': self.tipo
        }
