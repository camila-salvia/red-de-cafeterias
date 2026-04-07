import { pool } from "../shared/database/conn.mysql.js";
export class CategoriaRepository {
    async findAll() {
        const [categorias] = await pool.query('select * from categorias');
        //for (const categoria of categorias as Categoria[]) {
        // const [productos] = await pool.query('select * from productos where id = ?', 
        // [categoria.id])
        //VIDEO MYSQL FINDALL
        return categorias;
    }
    async findOne(item) {
        const id = Number.parseInt(item.id);
        const [categorias] = await pool.query('select * from categorias where id = ?', [id]);
        if (categorias.length === 0) {
            return undefined;
        }
        const categoria = categorias[0];
        return categoria;
    }
    async add(categoriaInput) {
        const { id, ...categoriaRow } = categoriaInput;
        const [result] = await pool.query('insert into categorias set ?', [categoriaRow]);
        categoriaInput.id = result.insertId.toString();
        return categoriaInput;
    }
    async update(categoriaInput) {
        const categoriaId = Number.parseInt(categoriaInput.id);
        const { ...categoriaRow } = categoriaInput;
        await pool.query('update categorias set ? where id = ?', [categoriaRow, categoriaId]);
        return await this.findOne({ id: categoriaInput.id });
    }
    async delete(item) {
        try {
            const categoriaToDelete = await this.findOne(item);
            const categoriaId = Number.parseInt(item.id);
            await pool.query('delete from categorias where id = ?', categoriaId);
            return categoriaToDelete;
        }
        catch (error) {
            throw new Error('unable to delete categoria');
        }
    }
}
//# sourceMappingURL=categoria.repository.js.map