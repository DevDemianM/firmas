from extensions import db

class Firma(db.Model):
    """Modelo para la tabla firma"""
    __bind_key__ = 'db4'
    __tablename__ = 'firma'
    __table_args__ = {'schema': 'firmas'}
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_agent = db.Column(db.String(255), nullable=False)
    ip = db.Column(db.String(45), nullable=False)  # inet en PostgreSQL = String en SQL Server
    created_at = db.Column(db.DateTime, nullable=False)
   
    
    def __repr__(self):
        return f'<Firma {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_agent': self.user_agent,
            'ip': self.ip,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'firma_imagen': self.firma_imagen
        }
    
