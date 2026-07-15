import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Dropdown extends Model {
declare id: string;
declare dropdown_type: string;
declare values?: Array<any>;
}

Dropdown.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    dropdown_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'dropdown',
    timestamps: false,
  }
);

export default Dropdown;
