from extensions import db
from .cliente import Cliente

class Documentos(db.Model):
    """Modelo para la tabla documentos"""
    __bind_key__ = 'db4'
    __table_args__ = {'schema': 'firmas'}
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_cliente = db.Column(db.String(15), db.ForeignKey('firmas.cliente.nit'), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    ciudad = db.Column(db.String(100), nullable=False)

    # Relaciones
    cliente = db.relationship('Cliente', backref='documentos')

    def __repr__(self):
        return f'<Documentos {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'id_cliente': self.id_cliente,
            'url': self.url,
            'ciudad': self.ciudad,
            'cliente': self.cliente.to_dict() if self.cliente else None
        }
