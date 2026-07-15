import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class User extends Model {
declare id: string;
declare otp: string | null;
declare password: string | null;
declare role: string | null;
declare token: string | null;
declare token_creation_date: Date | null;
declare user_type: string | null;
declare username: string | null;
declare is_active: boolean;
// New simple enabled flag (kept alongside legacy is_active for compatibility)
declare enabled: boolean;
declare allowed_routes: string[] | null;
declare created_at: string | null;
declare updated_at: string | null;

  // New features
declare failed_login_attempts: number;
declare locked_until: Date | null;
}

User.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    token_creation_date: {
      type: DataTypes.DATE(6),
      allowNull: true,
    },
    user_type: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    // New enabled flag for lightweight access control
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    // Allowed routes stored as JSON array
    allowed_routes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Locking mechanisms (new security features)
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user',
    timestamps: false,
  }
);

export default User;
