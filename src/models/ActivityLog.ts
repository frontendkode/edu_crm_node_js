import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class ActivityLog extends Model {
declare id: string;
declare created_at: string | null;
declare description: string | null;
declare log_result: string | null;
declare type: string;
declare lead_id: string | null;
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    log_result: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lead_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'lead_management',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'activity_log',
    timestamps: false,
  }
);

export default ActivityLog;
