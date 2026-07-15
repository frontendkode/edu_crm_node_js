import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Task extends Model {
declare id: string;
declare associated_lead: string | null;
declare created_at: string | null;
declare created_by: string | null;
declare description: string | null;
declare due_date: string | null;
declare priority: string | null;
declare staff_name: string | null;
declare status: string | null;
declare task_title: string;
declare task_type: string | null;
declare staff_id: string | null;
}

Task.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    associated_lead: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    due_date: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    staff_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    task_title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    task_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    staff_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'staff_management',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'task_management',
    timestamps: false,
  }
);

export default Task;
