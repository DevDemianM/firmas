from extensions import db
from .firma import Firma

class Cliente(db.Model):
    """Modelo para la tabla cliente"""
    __bind_key__ = 'db4'
    __table_args__ = {'schema': 'firmas'}
    
    nit = db.Column(db.String(15), primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    tipo_documento = db.Column(db.String(3), nullable=False)
    direccion = db.Column(db.String(50), nullable=False)
    correo_electronico = db.Column(db.String(50), nullable=False)
    telefono = db.Column(db.String(10), nullable=False)
    id_documento = db.Column(db.Integer, nullable=False)
    
    def __repr__(self):
        return f'<Cliente {self.nit}>'
    
    def to_dict(self):
        return {
            'nit': self.nit,
            'nombre': self.nombre,
            'tipo_documento': self.tipo_documento,
            'direccion': self.direccion,
            'correo_electronico': self.correo_electronico,
            'telefono': self.telefono,
            'id_documento': self.id_documento
        }
