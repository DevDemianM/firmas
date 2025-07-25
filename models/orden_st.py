from flask_sqlalchemy import SQLAlchemy
from extensions import db
from .documentos import Documentos

class OrdenST(db.Model):
    """Modelo para la tabla orden_ST"""
    __bind_key__ = 'db4'
    __table_args__ = {'schema': 'firmas'}
    
    id = db.Column(db.Integer, db.ForeignKey('firmas.documentos.id'), primary_key=True)
    responsable = db.Column(db.String(100), nullable=False)
    sede = db.Column(db.String(10), nullable=False)
    marca = db.Column(db.String(15), nullable=False)
    dispositivo = db.Column(db.String(50), nullable=False)
    imei = db.Column(db.String(20), nullable=False)
    estado_equipo = db.Column(db.String(30), nullable=True)
    problema = db.Column(db.Text, nullable=True)
    prende = db.Column(db.Boolean, nullable=False)
    bateria = db.Column(db.Boolean, nullable=False)
    porcentaje_bateria = db.Column(db.SmallInteger, nullable=True)
    codigo_seguridad = db.Column(db.String(10), nullable=True)
    correo_vinculado = db.Column(db.String(100), nullable=True)
    patron = db.Column(db.String(9), nullable=True)
    contraseña = db.Column(db.String(25), nullable=True)
    diagnostico = db.Column(db.String(255), nullable=True)
    valor_reparacion = db.Column(db.Numeric(10, 2), nullable=True)
    origen = db.Column(db.String(10), nullable=True)  # Campo para indicar el origen (ST, Manual, etc.)
    
    # Relación con Documentos
    documento = db.relationship('Documentos', backref=db.backref('orden_st', uselist=False))
    
    def __repr__(self):
        return f'<OrdenST {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'responsable': self.responsable,
            'sede': self.sede,
            'marca': self.marca,
            'dispositivo': self.dispositivo,
            'imei': self.imei,
            'estado_equipo': self.estado_equipo,
            'problema': self.problema,
            'prende': self.prende,
            'bateria': self.bateria,
            'porcentaje_bateria': self.porcentaje_bateria,
            'codigo_seguridad': self.codigo_seguridad,
            'correo_vinculado': self.correo_vinculado,
            'patron': self.patron,
            'contraseña': self.contraseña,
            'diagnostico': self.diagnostico,
            'valor_reparacion': float(self.valor_reparacion) if self.valor_reparacion else None,
            'origen': self.origen,
            'documento': self.documento.to_dict() if self.documento else None
        }
        
