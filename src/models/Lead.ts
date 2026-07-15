import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Lead extends Model {
declare id: string;
declare counselor: string | null;
declare course_interest: string | null;
declare created_at: string | null;
declare created_by: string | null;
declare email: string | null;
declare full_name: string;
declare notes: string | null;
declare phone_number: string | null;
declare source: string | null;
declare stage: string | null;
}

Lead.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    counselor: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    course_interest: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE(6),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    stage: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'lead_management',
    timestamps: false,
  }
);

export default Lead;
