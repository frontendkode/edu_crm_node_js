import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Session extends Model {
declare id: string;
declare expiration_time: Date | null;
declare token: string | null;
declare user_id: string | null;
}

Session.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    expiration_time: {
      type: DataTypes.DATE(6),
      allowNull: true,
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'session',
    timestamps: false,
  }
);

export default Session;
