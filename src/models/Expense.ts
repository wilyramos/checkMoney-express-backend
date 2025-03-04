import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AllowNull } from 'sequelize-typescript';
import Budget from './Budget';


@Table({
    tableName: 'expenses',
})

class Expense extends Model {

    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    declare name: string;

    @AllowNull(false)
    @Column({
        type: DataType.DECIMAL
    })
    declare amount: number;

    @ForeignKey(() => Budget)
    declare budgetId: number;

    @BelongsTo(() => Budget) // This is the reference to the Budget model
    declare budget: Budget; // This is the reference to the Budget model

}

export default Expense;