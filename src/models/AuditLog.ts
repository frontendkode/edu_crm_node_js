import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class AuditLog extends Model {
declare id: string;
declare user_id: string | null;
declare target_type: string;
declare target_id: string | null;
declare action: string;
declare details: string | null;
declare created_at: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
    },
    target_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    target_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_log',
    timestamps: false,
  }
);

export default AuditLog;
