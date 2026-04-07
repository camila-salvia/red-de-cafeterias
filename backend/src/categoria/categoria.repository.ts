import { Repository } from "../shared/repository.js";
import { Categoria } from "./categoria.entity.js";
import { pool } from "../shared/database/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { sanitizeCategoriaInput } from "./categoria.controller.js";

export class CategoriaRepository implements Repository<Categoria> {
  public async findAll(): Promise<Categoria[] | undefined> {
    const [categorias] = await pool.query('select * from categorias')
    //for (const categoria of categorias as Categoria[]) {
     // const [productos] = await pool.query('select * from productos where id = ?', 
       // [categoria.id])
//VIDEO MYSQL FINDALL
    return categorias as Categoria[]
  }

  public async findOne(item: { id: string; }): Promise<Categoria | undefined> {
    const id = Number.parseInt(item.id)
    const [categorias] = await pool.query<RowDataPacket[]>('select * from categorias where id = ?', 
      [id])
    if (categorias.length === 0) {
      return undefined
    }
    const categoria = categorias[0] as Categoria
    return categoria
  }

  public async add(categoriaInput: Categoria): Promise<Categoria | undefined> {
    const {id, ...categoriaRow} = categoriaInput
    const [result] = await pool.query<ResultSetHeader>('insert into categorias set ?',
      [categoriaRow])
    categoriaInput.id = result.insertId.toString()
    return categoriaInput
  }

  public async update(categoriaInput: Categoria): Promise<Categoria | undefined> {
    const categoriaId = Number.parseInt(categoriaInput.id)
    const {...categoriaRow} = categoriaInput
    await pool.query('update categorias set ? where id = ?', [categoriaRow, categoriaId])
    return await this.findOne({id: categoriaInput.id})
  }

  public async delete(item: { id: string }): Promise<Categoria | undefined> {
    try {
      const categoriaToDelete = await this.findOne(item)
      const categoriaId = Number.parseInt(item.id)
      await pool.query('delete from categorias where id = ?', categoriaId)
      return categoriaToDelete
    } catch (error: any) {
      throw new Error('unable to delete categoria')
    }
  }
}