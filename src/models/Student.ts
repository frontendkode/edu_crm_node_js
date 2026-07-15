import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Student extends Model {
declare id: string;
declare balance_fee: string | null;
declare batch: string | null;
declare class_count: string | null;
declare class_end_date: string | null;
declare class_start_date: string | null;
declare course: string | null;
declare created_at: string | null;
declare created_by: string | null;
declare email: string | null;
declare emi_enabled: string | null; // e.g. "true" / "false"
declare end_time: string | null;
declare full_name: string | null;
declare initial_amt: string | null;
declare phone_number: string | null;
declare shift: string | null;
declare split: string | null;
declare start_time: string | null;
declare status: string | null;
declare student_id: string | null;
declare total_fee: string | null;
declare user_id: string | null;
}

Student.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    balance_fee: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    batch: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    class_count: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    class_end_date: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    class_start_date: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    course: {
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
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    emi_enabled: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    end_time: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    initial_amt: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    shift: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    split: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    start_time: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    student_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    total_fee: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'student_management',
    timestamps: false,
  }
);

export default Student;
