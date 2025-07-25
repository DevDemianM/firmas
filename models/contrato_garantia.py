from extensions import db
from .documentos import Documentos

class ContratoGarantia(db.Model):
    """Modelo para la tabla contrato_garantia"""
    __bind_key__ = 'db4'
    __table_args__ = {'schema': 'firmas'}
    
    id = db.Column(db.Integer, db.ForeignKey('firmas.documentos.id'), primary_key=True)
    responsable = db.Column(db.String(100), nullable=False)
    sede = db.Column(db.String(10), nullable=False)
    marca = db.Column(db.String(15), nullable=False)
    dispositivo = db.Column(db.String(50), nullable=False)
    imei = db.Column(db.String(20), nullable=False)
    estado_equipo = db.Column(db.String(30), nullable=False)
    problema = db.Column(db.Text, nullable=False)
    codigo_seguridad = db.Column(db.String(10))
    patron = db.Column(db.String(9))
    correo_vinculado = db.Column(db.String(100))
    contraseña = db.Column(db.String(25))
    diagnostico = db.Column(db.String(255))
    
    # Relación con Documentos
    documento = db.relationship('Documentos', backref='contrato_garantia', uselist=False)
    
    def __repr__(self):
        return f'<ContratoGarantia {self.id}>'
    
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
            'codigo_seguridad': self.codigo_seguridad,
            'patron': self.patron,
            'correo_vinculado': self.correo_vinculado,
            'contraseña': self.contraseña,
            'diagnostico': self.diagnostico,
            'documento': self.documento.to_dict() if self.documento else None
        } 