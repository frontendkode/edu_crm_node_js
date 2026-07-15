import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class DueDate extends Model {
declare id: string;
declare create_at: string | null;
declare due_amt: string | null;
declare due_date: string | null;
declare due_no: string | null;
declare payment_date: string | null;
declare payment_type: string | null;
declare status: string | null;
declare student_management_id: string | null;
}

DueDate.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    create_at: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    due_amt: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    due_date: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    due_no: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    payment_date: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    payment_type: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
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
    tableName: 'due_date',
    timestamps: false,
  }
);

export default DueDate;
