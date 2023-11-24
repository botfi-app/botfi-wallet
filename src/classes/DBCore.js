import Utils from "./Utils";

class DBCore {

    db = null;
    
    async load(dbName) {
        var idbAdapter = new LokiIndexedAdapter('__db');
        this.db = new loki(dbName, { adapter: idbAdapter });
    }

    async insert(table, data) {
        let _col = db.addCollection(table);
        _col.insert(data);
        Utils.runBlocking(() => db.saveDatabase())
    }

    async find(table, cond) {
        let _col = db.addCollection(table);
        let results = _col.find(cond);
        return results
    }

    async findOne(table, cond) {
        let _col = db.addCollection(table);
        let results = _col.findOne(cond);
        return results
    }
}