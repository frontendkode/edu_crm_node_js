import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class DropdownValue extends Model {
declare dropdown_id: string;
declare value: string;
}

DropdownValue.init(
  {
    dropdown_id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'dropdown',
        key: 'id',
      },
    },
    value: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'dropdown_values',
    timestamps: false,
  }
);

export default DropdownValue;
