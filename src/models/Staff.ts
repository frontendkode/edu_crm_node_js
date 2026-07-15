import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Staff extends Model {
declare id: string;
declare created_at: string | null;
declare created_by: string | null;
declare department: string | null;
declare email: string | null;
declare id_proof: string | null;
declare joining_date: string | null;
declare name: string;
declare phone_no: string | null;
declare proof_no: string | null;
declare role: string | null;
declare user_id: string | null;
declare is_active: boolean;
declare updated_at: string | null;
}

Staff.init(
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
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    id_proof: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    joining_date: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone_no: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    proof_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    updated_at: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'staff_management',
    timestamps: false,
  }
);

export default Staff;
