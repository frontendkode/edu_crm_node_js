import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class ReminderLog extends Model {
declare id: string;
declare created_at: string | null;
declare description: string | null;
declare reminder_date: string | null;
declare reminder_time: string | null;
declare type: string | null;
declare lead_id: string | null;
}

ReminderLog.init(
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
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    reminder_date: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reminder_time: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    tableName: 'reminder_log',
    timestamps: false,
  }
);

export default ReminderLog;
