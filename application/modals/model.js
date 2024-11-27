const db = require('../config/db');

class LoginModel {
    static async employeeCheckQuery(email, restPosCode, macAddress) {
        const query = `
          SELECT * FROM emplyoee 
          WHERE LOWER(email) = LOWER(?) 
            AND restPosCode = ? 
            AND macAddress = ? 
            AND isActive = 1
        `;

        const [rows] = await db.query(query, [email, restPosCode, macAddress]); // Using prepared statements for security
        return rows;
    }

    static async getById(tableName, columnName, value) {
        const query = `SELECT * FROM ${tableName} WHERE ${columnName} = ?`;
        const [rows] = await db.query(query, [value]);
        return rows;
    }

    static async insert(tableName, data) {
        const query = `INSERT INTO ${tableName} SET ?`; 
        const [result] = await db.query(query, data); 
        return result;  
    }

    static async getSelectedData(info, tableName, where = '', order = '', type = '', limit = '', start = '') {
        let query = `SELECT ${info.join(', ')} FROM ${tableName}`;

        // Add WHERE clause if provided
        if (where) {
            const conditions = Object.entries(where)
                .map(([key, value]) => `${key} = ${db.escape(value)}`)
                .join(' AND ');
            query += ` WHERE ${conditions}`;
        }

        // Add ORDER BY clause if provided
        if (order && type) {
            query += ` ORDER BY ${order} ${type}`;
        }

        // Add LIMIT clause if provided
        if (limit) {
            if (start) {
                query += ` LIMIT ${start}, ${limit}`;
            } else {
                query += ` LIMIT ${limit}`;
            }
        }

        try {
            const [rows] = await db.query(query);
            return rows.length > 0 ? rows : [];
        } catch (error) {
            console.error('Database query error:', error);
            return [];
        }
    }

    static async getSelectedData(info, tableName, where = '', order = '', type = '', limit = '', start = '') {
        let query = `SELECT ${info.join(', ')} FROM ${tableName}`;

        if (where) {
            const conditions = Object.entries(where)
                .map(([key, value]) => `${key} = ${db.escape(value)}`)
                .join(' AND ');
            query += ` WHERE ${conditions}`;
        }

        if (order && type) {
            query += ` ORDER BY ${order} ${type}`;
        }

        if (limit) {
            if (start) {
                query += ` LIMIT ${start}, ${limit}`;
            } else {
                query += ` LIMIT ${limit}`;
            }
        }

        try {
            const [rows] = await db.query(query);
            return rows.length > 0 ? rows : [];
        } catch (error) {
            console.error('Database query error:', error);
            return [];
        }
    }

    static dataWithSubquery = async (selectColMaintable, selectColSubtable, maintable, subtable, colMatch, where, groupBy = false) => {
        try {
            // Convert column arrays to comma-separated strings
            const selectColsMain = selectColMaintable.join(', ');
            const selectColsSub = selectColSubtable.join(', ');
    
            // Construct the subquery
            const subQuery = `SELECT ${selectColsSub} FROM ${subtable} WHERE ?`;
    
            // Construct the main query with subquery
            let mainQuery = `SELECT ${selectColsMain} FROM ${maintable} WHERE ${colMatch} IN (${subQuery})`;
    
            // Add group by clause if applicable
            if (groupBy) {
                mainQuery += ` GROUP BY ${groupBy}`;
            }
    
            // Execute the main query using db.query or db.execute
            const results = await db.query(mainQuery, [where]);
    
            // Return the results if any, otherwise return an empty array
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;  // Handle the error appropriately
        }
    };
    
    
}

module.exports = LoginModel;

