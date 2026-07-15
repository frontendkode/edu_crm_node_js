import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Attendance extends Model {
declare id: string;
declare attend: string | null;
declare create_at: string | null;
declare date: string | null;
declare day: string | null;
declare student_management_id: string | null;
}

Attendance.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    attend: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    create_at: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    date: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    day: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    student_management_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'student_management',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'attendance',
    timestamps: false,
  }
);

export default Attendance;
